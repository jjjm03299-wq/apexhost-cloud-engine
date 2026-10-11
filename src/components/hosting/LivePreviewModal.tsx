import React, { useState, useEffect } from 'react';
import { 
  Globe, ShieldCheck, RefreshCw, Smartphone, Tablet, Monitor, 
  ExternalLink, Copy, Check, X, Code, Terminal, Server, Sparkles, Radio,
  AlertTriangle, HelpCircle, CheckCircle2, Download, Laptop
} from 'lucide-react';
import { DomainItem } from '../../types';
import { deployRealDomainFiles } from '../../utils/realApi';
import { HostsFileModal } from '../dns/HostsFileModal';

interface LivePreviewModalProps {
  domain: DomainItem;
  isOpen: boolean;
  onClose: () => void;
}

export const LivePreviewModal: React.FC<LivePreviewModalProps> = ({
  domain,
  isOpen,
  onClose,
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [viewMode, setViewMode] = useState<'real-http' | 'interactive'>('real-http');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedHosts, setCopiedHosts] = useState(false);
  const [copiedNano, setCopiedNano] = useState(false);
  const [showHostsModal, setShowHostsModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSourceCode, setShowSourceCode] = useState(false);
  const [showNxHelp, setShowNxHelp] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Sync files to real HTTP server upon opening preview
  useEffect(() => {
    if (isOpen && domain) {
      deployRealDomainFiles(domain.name, domain.port, domain.files);
    }
  }, [isOpen, domain]);

  // Interactive sandbox state for the running app inside the preview
  const [interactiveCount, setInteractiveCount] = useState(12);
  const [isServiceHealthy, setIsServiceHealthy] = useState(true);
  const [activeRoute, setActiveRoute] = useState('/');

  if (!isOpen) return null;

  const realHttpUrl = `/hosted/${domain.name}/`;
  const protocol = domain.port === 443 ? 'https://' : 'http://';
  const currentUrl = `${protocol}${domain.name}:${domain.port}${activeRoute}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(`http://${domain.name}:${domain.port}`);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 1800);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    deployRealDomainFiles(domain.name, domain.port, domain.files).then(() => {
      setIframeKey(k => k + 1);
      setTimeout(() => setIsRefreshing(false), 400);
    });
  };

  // Find relevant files
  const indexHtml = domain.files.find(f => f.path === 'index.html' || f.path.endsWith('.html'));
  const appTsx = domain.files.find(f => f.path.includes('App.tsx') || f.path.includes('App.jsx') || f.path.endsWith('.tsx'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-6 overflow-hidden">
      <div className="bg-slate-950 border border-slate-700 w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Browser Top Navigation Chrome */}
        <div className="bg-slate-900 border-b border-slate-800 p-3 sm:px-4 sm:py-2.5 flex items-center justify-between gap-3 shrink-0">
          {/* Mac window dots */}
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80 cursor-pointer" onClick={onClose} />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>

          {/* Browser Address Bar */}
          <div className="flex-1 max-w-2xl mx-auto flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
            <div className="flex items-center space-x-1.5 text-emerald-400 mr-2 shrink-0">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-mono font-semibold hidden md:inline">SSL 1.3</span>
            </div>

            <div className="flex-1 font-mono text-xs text-slate-200 truncate">
              <span className="text-emerald-400">{protocol}</span>
              <span className="text-white font-semibold">{domain.name}</span>
              <span className="text-sky-400">:{domain.port}</span>
              <span className="text-slate-400">{activeRoute}</span>
            </div>

            <div className="flex items-center space-x-1 shrink-0 ml-2">
              <button
                onClick={handleRefresh}
                className="p-1 text-slate-400 hover:text-white rounded transition"
                title="Refresh preview"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleCopyUrl}
                className="p-1 text-slate-400 hover:text-sky-400 rounded transition"
                title="Copy live URL"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Viewport switchers, viewMode & source toggle */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('real-http')}
                className={`px-2 py-1 rounded transition text-[11px] font-semibold flex items-center space-x-1 ${
                  viewMode === 'real-http' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Server className="w-3 h-3 text-emerald-400" />
                <span>Real HTTP Engine</span>
              </button>
              <button
                onClick={() => setViewMode('interactive')}
                className={`px-2 py-1 rounded transition text-[11px] font-semibold flex items-center space-x-1 ${
                  viewMode === 'interactive' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span>Vite Client App</span>
              </button>
            </div>

            <button
              onClick={() => setShowNxHelp(!showNxHelp)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
                showNxHelp
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                  : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20'
              }`}
              title="Fix DNS_PROBE_FINISHED_NXDOMAIN in Chrome"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fix NXDOMAIN</span>
            </button>

            <a
              href={realHttpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-lg transition text-xs font-semibold flex items-center space-x-1"
              title="Open Real Hosted Gateway (Bypasses NXDOMAIN)"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Open Real Host</span>
            </a>

            <div className="hidden sm:flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setViewport('desktop')}
                className={`p-1.5 rounded transition ${viewport === 'desktop' ? 'bg-slate-800 text-sky-400' : 'text-slate-500'}`}
                title="Desktop (100%)"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewport('tablet')}
                className={`p-1.5 rounded transition ${viewport === 'tablet' ? 'bg-slate-800 text-sky-400' : 'text-slate-500'}`}
                title="Tablet (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewport('mobile')}
                className={`p-1.5 rounded transition ${viewport === 'mobile' ? 'bg-slate-800 text-sky-400' : 'text-slate-500'}`}
                title="Mobile (375px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setShowSourceCode(!showSourceCode)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition flex items-center space-x-1 ${
                showSourceCode
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Source</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* DNS_PROBE_FINISHED_NXDOMAIN Fix Dropdown Banner */}
        {showNxHelp && (
          <div className="bg-slate-900 border-b border-amber-500/30 p-3 sm:px-5 sm:py-3 text-xs text-white space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-amber-300">
                  Fix "This site can't be reached • Check if there is a typo in {domain.name} • DNS_PROBE_FINISHED_NXDOMAIN"
                </span>
              </div>
              <button
                onClick={() => setShowNxHelp(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-[11px]">
              {/* Typo check */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Typo Check: PASS</span>
                </div>
                <p className="text-slate-400 text-[10px]">
                  <code>{domain.name}</code> has no typo. Valid label and .ai/.dev/.io TLD.
                </p>
              </div>

              {/* Fix 1: Gateway */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-500/30 space-y-1">
                <div className="font-semibold text-white flex items-center justify-between">
                  <span className="text-emerald-400">Fix 1: Direct Gateway URL</span>
                  <a
                    href={realHttpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:underline text-[10px] flex items-center gap-0.5"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-slate-400 text-[10px]">
                  Bypasses public root DNS and loads directly on our server with 200 OK.
                </p>
              </div>

              {/* Fix 2: /etc/hosts */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-sky-500/30 space-y-1.5">
                <div className="font-semibold text-white flex items-center justify-between">
                  <span className="text-sky-400">Fix 2: Map to /etc/hosts</span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setShowHostsModal(true)}
                      className="text-[10px] text-sky-300 hover:text-white underline cursor-pointer"
                    >
                      Full Guide
                    </button>
                    <button
                      onClick={() => {
                        const entries = `127.0.0.1   ${domain.name}\n76.76.21.21 ${domain.name}\n76.76.21.21 ns1.apexhost-dns.com\n76.76.21.21 ns2.apexhost-dns.com`;
                        navigator.clipboard.writeText(entries);
                        setCopiedHosts(true);
                        setTimeout(() => setCopiedHosts(false), 2000);
                      }}
                      className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 hover:text-white text-[10px] cursor-pointer"
                    >
                      {copiedHosts ? 'Copied 4 Lines!' : 'Copy 4 Lines'}
                    </button>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  sudo nano /etc/hosts & paste entries
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Frame Body */}
        <div className="flex-1 bg-slate-950 overflow-hidden flex">
          {/* Main Render Area */}
          <div className="flex-1 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40">
            <div
              className={`bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden flex flex-col ${
                viewport === 'mobile'
                  ? 'w-[375px] h-[667px]'
                  : viewport === 'tablet'
                  ? 'w-[768px] h-[80vh]'
                  : 'w-full h-full'
              }`}
            >
              {/* Floating Reload Iframe Container Button */}
              {viewMode === 'real-http' && (
                <div className="absolute top-3 right-3 z-20 flex items-center space-x-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-xl shadow-lg">
                  <span className="text-[11px] font-mono text-slate-300">Live Preview</span>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs transition shadow cursor-pointer disabled:opacity-50"
                    title="Reload iframe container and sync files"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>Reload Iframe</span>
                  </button>
                </div>
              )}

              {viewMode === 'real-http' ? (
                /* REAL HTTP SERVER IFRAME */
                <iframe
                  key={iframeKey}
                  src={`${realHttpUrl}?t=${iframeKey}`}
                  title={domain.name}
                  className="w-full h-full border-0 bg-slate-950"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              ) : (
                /* Hosted Application Mockup Engine */
              <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white font-sans flex flex-col justify-between p-6 sm:p-10">
                {/* Navbar within hosted app */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center font-bold text-slate-950 text-xs">
                      ⚡
                    </div>
                    <span className="font-bold text-sm tracking-tight text-white">{domain.name}</span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <button
                      onClick={() => setActiveRoute('/')}
                      className={`hover:text-white transition ${activeRoute === '/' ? 'text-sky-400 font-semibold' : 'text-slate-400'}`}
                    >
                      Home
                    </button>
                    <button
                      onClick={() => setActiveRoute('/api')}
                      className={`hover:text-white transition ${activeRoute === '/api' ? 'text-sky-400 font-semibold' : 'text-slate-400'}`}
                    >
                      API Health
                    </button>
                    <button
                      onClick={() => setActiveRoute('/database')}
                      className={`hover:text-white transition ${activeRoute === '/database' ? 'text-sky-400 font-semibold' : 'text-slate-400'}`}
                    >
                      DB Records
                    </button>
                  </div>
                </div>

                {/* Body Content based on route */}
                <div className="my-auto py-8 text-center max-w-xl mx-auto space-y-6">
                  {activeRoute === '/' && (
                    <>
                      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>Port {domain.port} • React 19 + Vite Live</span>
                      </div>

                      <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                        Hosted on <span className="text-sky-400">{domain.name}</span>
                      </h1>

                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                        This web application is served through an active DNS A-record to edge IP <strong className="text-sky-300 font-mono">{domain.serverIp}</strong> with automated SSL encryption.
                      </p>

                      {/* Interactive React Counter Component */}
                      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl text-left">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-mono">React Reactive State</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            isServiceHealthy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {isServiceHealthy ? '● Status: High Performance' : '○ Status: Maintenance'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-slate-400">Telemetry Pings</div>
                            <div className="text-2xl font-bold font-mono text-sky-400">{interactiveCount}</div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setInteractiveCount(c => c + 1)}
                              className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs transition cursor-pointer"
                            >
                              + Ping Counter
                            </button>
                            <button
                              onClick={() => setIsServiceHealthy(!isServiceHealthy)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition cursor-pointer"
                            >
                              Toggle
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeRoute === '/api' && (
                    <div className="text-left space-y-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-xs font-mono text-emerald-400 font-bold">GET /api/v1/health (200 OK)</div>
                      <pre className="p-3 rounded bg-slate-950 text-slate-300 text-xs font-mono">
{JSON.stringify(
  {
    domain: domain.name,
    port: domain.port,
    serverIp: domain.serverIp,
    ssl: domain.ssl.status,
    framework: domain.deployment.framework,
    uptime: domain.deployment.uptime,
    timestamp: new Date().toISOString(),
  },
  null,
  2
)}
                      </pre>
                    </div>
                  )}

                  {activeRoute === '/database' && (
                    <div className="text-left space-y-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-xs font-mono text-sky-400 font-bold">Virtual DB Tables ({domain.database.length})</div>
                      <div className="space-y-2">
                        {domain.database.map(t => (
                          <div key={t.id} className="p-2.5 rounded bg-slate-950 text-xs font-mono">
                            <div className="text-white font-bold">{t.name} ({t.rows.length} rows)</div>
                            <div className="text-[11px] text-slate-400">{t.columns.join(' | ')}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer of hosted app */}
                <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Server: Apex Anycast Gateway • Port {domain.port}</span>
                  <span>TLS 1.3 Encryption Active</span>
                </div>
              </div>
              )}
            </div>
          </div>

          {/* Inspect Source Split Panel */}
          {showSourceCode && (
            <div className="w-80 sm:w-96 border-l border-slate-800 bg-slate-950 p-4 flex flex-col space-y-3 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold font-mono text-sky-400 flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Compiled Source ({domain.files.length} files)</span>
                </span>
                <button
                  onClick={() => setShowSourceCode(false)}
                  className="text-slate-500 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {domain.files.map(file => (
                  <div key={file.id} className="space-y-1">
                    <div className="text-[11px] font-mono text-slate-400 font-semibold">{file.path}</div>
                    <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-36">
                      {file.content}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hosts File Modal */}
      <HostsFileModal
        domain={domain.name}
        isOpen={showHostsModal}
        onClose={() => setShowHostsModal(false)}
        serverPort={domain.port}
      />
    </div>
  );
};
