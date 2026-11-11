import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import HeroInput from './HeroInput';
import HowItWorks from './HowItWorks';
import FeatureGrid from './FeatureGrid';
import OperationalGuide from './OperationalGuide';
import PreviewBanner from '../common/PreviewBanner';
import AsciiClouds from './AsciiClouds';

gsap.registerPlugin(useGSAP);

/**
 * LandingPage Composite Component
 * 
 * Unites HeroInput, HowItWorks 3-step walkthrough, FeatureGrid 6 capability showcase,
 * and OperationalGuide 3-panel manual with orchestrated GSAP entrance choreography.
 * Supports prefers-reduced-motion via gsap.matchMedia().
 */
export default function LandingPage({ onSubmit, loading }) {
  const containerRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add({
      isNormal: "(prefers-reduced-motion: no-preference)",
      isReduced: "(prefers-reduced-motion: reduce)"
    }, (context) => {
      const { isReduced } = context.conditions;

      if (isReduced) {
        gsap.set('[data-animate="hero-title"], [data-animate="hero-form"], [data-animate="how-it-works"], [data-animate="feature-card"], [data-animate="operational-guide"]', {
          autoAlpha: 1,
          y: 0,
          scale: 1
        });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.from('[data-animate="hero-title"]', {
        y: 12,
        autoAlpha: 0,
        duration: 0.4,
        ease: "power2.out"
      })
      .from('[data-animate="hero-form"]', {
        y: 14,
        autoAlpha: 0,
        duration: 0.4,
        ease: "power2.out"
      }, "-=0.25")
      .from('[data-animate="how-it-works"]', {
        y: 16,
        autoAlpha: 0,
        duration: 0.4,
        ease: "power2.out"
      }, "-=0.2")
      .from('[data-animate="feature-card"]', {
        y: 14,
        autoAlpha: 0,
        duration: 0.35,
        stagger: 0.05,
        ease: "power2.out"
      }, "-=0.2")
      .from('[data-animate="operational-guide"]', {
        y: 14,
        autoAlpha: 0,
        duration: 0.35,
        ease: "power2.out"
      }, "-=0.15");
    });
  }, { scope: containerRef, dependencies: [] });

  return (
    <div ref={containerRef} className="relative overflow-hidden w-full max-w-7xl mx-auto px-2 sm:px-4 py-2 flex flex-col gap-8 md:gap-10">
      <AsciiClouds />

      {/* 1. Primary Hero Section with Form & Mode Preview */}
      <section className="w-full flex justify-center">
        <HeroInput onSubmit={onSubmit} loading={loading} />
      </section>

      {/* 2. Visual 3-Step Walkthrough Guide */}
      <section className="w-full">
        <HowItWorks />
      </section>

      {/* 3. Core Capability Breakdown Grid */}
      <section className="w-full">
        <FeatureGrid />
      </section>

      {/* 4. Operational Instructions & Configuration Guide */}
      <section className="w-full">
        <OperationalGuide />
      </section>
    </div>
  );
}
