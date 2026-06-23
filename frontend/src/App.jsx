import { useState, useEffect } from 'react';
import axios from 'axios';
import { Github, Rocket, Loader2, CheckCircle2, AlertCircle, Download } from 'lucide-react';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('IDLE'); // IDLE, QUEUED, PROCESSING, COMPLETED, FAILED
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);

  const isValidGithubUrl = (url) => {
    return /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+(\/)?$/.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!isValidGithubUrl(repoUrl)) {
      setError("Please enter a valid public GitHub repository URL.");
      return;
    }

    try {
      setStatus('QUEUED');
      setMessage('Submitting job...');
      const response = await axios.post('/api/job', { repo_url: repoUrl });
      setJobId(response.data.job_id);
    } catch (err) {
      setStatus('FAILED');
      setError(err.response?.data?.detail || "Failed to start job. Please try again.");
    }
  };

  useEffect(() => {
    let interval;
    if (jobId && ['QUEUED', 'PROCESSING'].includes(status)) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`/api/job/${jobId}`);
          const data = res.data;
          setStatus(data.status);
          setMessage(data.message);
          setProgress(data.progress || 0);
          if (data.download_url) {
            setDownloadUrl(data.download_url);
          }
        } catch (err) {
          console.error("Error polling status", err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [jobId, status]);

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Starfield (Simplified CSS representation via backdrop and radial gradient in css) */}
      
      <div className="z-10 w-full max-w-3xl flex flex-col items-center">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-neon-blue bg-opacity-20 mb-4 animate-pulse-ring">
            <Rocket className="w-8 h-8 text-neon-blue" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-starlight to-neon-blue">
            Autonomous Codebase Documenter
          </h1>
          <p className="text-lg text-starlight opacity-80 max-w-2xl mx-auto">
            Input a public GitHub repository and let the system map, analyze, and generate comprehensive documentation autonomously.
          </p>
        </div>

        {status === 'IDLE' && (
          <form onSubmit={handleSubmit} className="w-full glass-panel p-6 md:p-8 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Github className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="w-full pl-12 pr-4 py-4 bg-deep-space bg-opacity-50 border border-gray-700 rounded-lg focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue text-white placeholder-gray-500 transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              className="glow-btn px-8 py-4 rounded-lg flex items-center justify-center gap-2"
            >
              <span>Generate Docs</span>
            </button>
          </form>
        )}

        {error && status !== 'FAILED' && (
          <div className="mt-4 p-4 glass-panel border-red-500/50 bg-red-500/10 text-red-200 flex items-center gap-3 w-full">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {(status === 'QUEUED' || status === 'PROCESSING') && (
          <div className="w-full glass-panel p-8 flex flex-col items-center">
            <div className="relative w-20 h-20 mb-6">
              <svg className="w-full h-full animate-spin text-neon-blue" viewBox="0 0 100 100">
                <circle className="opacity-20" cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" fill="none" />
                <circle className="opacity-100" cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray="283" strokeDashoffset={283 - (283 * progress) / 100} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                {progress}%
              </div>
            </div>
            <h3 className="text-xl font-medium mb-2 flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing Job
            </h3>
            <p className="text-starlight opacity-80 text-center">{message}</p>
          </div>
        )}

        {status === 'COMPLETED' && (
          <div className="w-full glass-panel p-8 flex flex-col items-center border-green-500/30">
            <div className="p-4 rounded-full bg-green-500/20 mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Documentation Ready!</h3>
            <p className="text-starlight opacity-80 mb-8 text-center">{message}</p>
            {downloadUrl && (
              <a
                href={downloadUrl}
                download
                className="glow-btn px-8 py-4 rounded-lg flex items-center gap-2 border border-neon-blue/30"
              >
                <Download className="w-5 h-5" />
                <span>Download Documentation (.zip)</span>
              </a>
            )}
            <button 
              onClick={() => { setStatus('IDLE'); setRepoUrl(''); setJobId(null); setProgress(0); }}
              className="mt-6 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Analyze another repository
            </button>
          </div>
        )}

        {status === 'FAILED' && (
          <div className="w-full glass-panel p-8 flex flex-col items-center border-red-500/30">
            <div className="p-4 rounded-full bg-red-500/20 mb-6">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Analysis Failed</h3>
            <p className="text-starlight opacity-80 mb-6 text-center text-red-200">{error || message}</p>
            <button 
              onClick={() => { setStatus('IDLE'); setJobId(null); setProgress(0); setError(null); }}
              className="px-6 py-3 rounded-lg border border-gray-600 hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <footer className="mt-auto pt-10 pb-4 text-center text-sm text-gray-500">
        Built by Bryan Thomas
      </footer>
    </div>
  );
}

export default App;
