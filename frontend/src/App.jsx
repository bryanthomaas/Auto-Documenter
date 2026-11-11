import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import HeroInput from './components/landing/HeroInput';
import LandingPage from './components/landing/LandingPage';
import LiveProgress from './components/progress/LiveProgress';
import DocsWorkspace from './components/workspace/DocsWorkspace';
import OceanBackground from './components/common/OceanBackground';

gsap.registerPlugin(useGSAP);

export default function App() {
  const [viewState, setViewState] = useState('IDLE'); // 'IDLE' | 'PROCESSING' | 'WORKSPACE'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('IDLE');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [docs, setDocs] = useState(null);

  const eventSourceRef = useRef(null);
  const viewContainerRef = useRef(null);

  const transitionTo = (nextState, callback) => {
    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: false });
    } else if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (viewContainerRef.current && !prefersReducedMotion) {
      gsap.to(viewContainerRef.current, {
        autoAlpha: 0,
        y: -15,
        scale: 0.98,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          if (callback) callback();
          setViewState(nextState);
        }
      });
    } else {
      if (callback) callback();
      setViewState(nextState);
    }
  };

  // Lenis Smooth Scroll Integration with GSAP Ticker Synchronization
  useEffect(() => {
    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      smoothWheel: true,
      smoothTouch: false,
    });

    window.__lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    const tickerUpdate = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerUpdate);
    gsap.ticker.lagSmoothing(0);

    return () => {
      cancelAnimationFrame(rafId);
      gsap.ticker.remove(tickerUpdate);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add({
      isNormal: "(prefers-reduced-motion: no-preference)",
      isReduced: "(prefers-reduced-motion: reduce)"
    }, (context) => {
      const { isReduced } = context.conditions;
      if (isReduced) {
        if (viewContainerRef.current) {
          gsap.set(viewContainerRef.current, { autoAlpha: 1, y: 0, scale: 1 });
        }
        return;
      }
      if (viewContainerRef.current) {
        gsap.fromTo(
          viewContainerRef.current,
          { autoAlpha: 0, y: 20, scale: 0.98 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: 'power2.out', clearProps: 'transform' }
        );
      }
    });
  }, { scope: viewContainerRef, dependencies: [viewState] });

  const startJob = async ({ repoUrl, depth, apiKey }) => {
    setError(null);
    setIsSubmitting(true);
    let jobFailed = false;

    transitionTo('PROCESSING', () => {
      setViewState('PROCESSING');
      if (!jobFailed) {
        setStatus('QUEUED');
        setProgress(5);
        setMessage('Submitting repository for analysis...');
      }
    });

    try {
      const response = await axios.post('/api/job', {
        repo_url: repoUrl,
        depth: depth,
        api_key: apiKey || null
      });

      const newJobId = response.data.job_id;
      setJobId(newJobId);
      connectEventStream(newJobId);
    } catch (err) {
      jobFailed = true;
      setStatus('FAILED');
      setError(err.response?.data?.detail || 'Failed to submit repository. Please verify the URL and backend server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const connectEventStream = (id) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(`/api/job/${id}/events`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setStatus(data.status);
        setProgress(data.progress || 0);
        setMessage(data.message || '');

        if (data.download_url) {
          setDownloadUrl(data.download_url);
        }

        if (data.docs) {
          setDocs(data.docs);
        }

        if (data.status === 'COMPLETED' && data.docs) {
          eventSource.close();
          setProgress(100);
          setMessage('Documentation generated successfully! Preparing workspace...');
          setTimeout(() => {
            transitionTo('WORKSPACE', () => {
              setViewState('WORKSPACE');
            });
          }, 800);
        } else if (data.status === 'FAILED') {
          eventSource.close();
          setError(data.error || data.message || 'Generation failed.');
        }
      } catch (e) {
        console.error('Failed to parse SSE payload', e);
      }
    };

    eventSource.onerror = (err) => {
      console.warn('SSE connection closed or lost. Polling once.', err);
      axios.get(`/api/job/${id}`)
        .then(res => {
          if (res.data.status === 'COMPLETED' && res.data.docs) {
            setDocs(res.data.docs);
            if (res.data.download_url) setDownloadUrl(res.data.download_url);
            transitionTo('WORKSPACE', () => {
              setViewState('WORKSPACE');
            });
            eventSource.close();
          } else if (res.data.status === 'FAILED') {
            setStatus('FAILED');
            setError(res.data.error || 'Generation failed.');
            eventSource.close();
          }
        })
        .catch(() => {});
    };
  };

  const handleReset = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    transitionTo('IDLE', () => {
      setViewState('IDLE');
      setJobId(null);
      setStatus('IDLE');
      setProgress(0);
      setMessage('');
      setError(null);
      setDownloadUrl(null);
      setDocs(null);
    });
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between overflow-x-clip relative">
      <OceanBackground />
      <div ref={viewContainerRef} className="flex-1 flex flex-col w-full relative z-10">
        {/* View State: Interactive Documentation Workspace */}
        {viewState === 'WORKSPACE' && docs ? (
          <DocsWorkspace
            docs={docs}
            downloadUrl={downloadUrl}
            onReset={handleReset}
          />
        ) : (
          /* View State: Landing & Live Generation Progress */
          <div className="flex-1 flex flex-col justify-center items-center px-4 py-6 md:py-8 max-w-7xl mx-auto w-full">
            {viewState === 'IDLE' && (
              <LandingPage onSubmit={startJob} loading={isSubmitting} />
            )}

            {viewState === 'PROCESSING' && (
              <LiveProgress
                status={status}
                progress={progress}
                message={message}
                error={error}
                onRetry={handleReset}
              />
            )}

            <footer className="mt-10 text-center text-xs text-[#B2C6FA] font-sans">
              <p>Autonomous Codebase Documenter</p>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}
