import React, { useState, useRef, KeyboardEvent, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Lock, Share, X, Plus, Home, Copy } from 'lucide-react';
import type { BrowserTab } from '../../types';

const BROWSER_STORAGE_KEY = 'browser_session_tabs_v1';
const BROWSER_ACTIVE_TAB_KEY = 'browser_session_active_v1';
const DEFAULT_URL = 'https://www.google.com/webhp?igu=1';

const BrowserApp: React.FC = () => {
    const [tabs, setTabs] = useState<BrowserTab[]>([]);
    const [activeTabId, setActiveTabId] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [isTabOverviewOpen, setTabOverviewOpen] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    
    // Load session from localStorage on initial mount
    useEffect(() => {
        try {
            const savedTabs = localStorage.getItem(BROWSER_STORAGE_KEY);
            const savedActiveTabId = localStorage.getItem(BROWSER_ACTIVE_TAB_KEY);

            if (savedTabs && savedActiveTabId) {
                const parsedTabs = JSON.parse(savedTabs);
                if (Array.isArray(parsedTabs) && parsedTabs.length > 0) {
                    setTabs(parsedTabs);
                    setActiveTabId(savedActiveTabId);
                    return;
                }
            }
        } catch (e) {
            console.error("Failed to load browser session:", e);
        }
        // If nothing is loaded, create a default tab
        handleNewTab();
    }, []);

    // Save session to localStorage whenever tabs or active tab changes
    useEffect(() => {
        if (tabs.length > 0 && activeTabId) {
            try {
                localStorage.setItem(BROWSER_STORAGE_KEY, JSON.stringify(tabs));
                localStorage.setItem(BROWSER_ACTIVE_TAB_KEY, activeTabId);
            } catch (e) {
                console.error("Failed to save browser session:", e);
            }
        } else if (tabs.length === 0) {
            localStorage.removeItem(BROWSER_STORAGE_KEY);
            localStorage.removeItem(BROWSER_ACTIVE_TAB_KEY);
        }
    }, [tabs, activeTabId]);
    
    const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId), [tabs, activeTabId]);
    const currentUrl = activeTab?.history[activeTab.historyIndex] ?? 'about:blank';
    
    useEffect(() => {
        setInputValue(currentUrl);
    }, [currentUrl]);


    const navigate = (url: string) => {
        if (!activeTabId) return;

        let fullUrl = url.trim();
        if (!fullUrl) return;

        if (!/^(https?:\/\/|about:blank)/i.test(fullUrl)) {
             try {
                new URL(`https://${fullUrl}`);
                fullUrl = `https://${fullUrl}`;
            } catch (e) {
                 fullUrl = `https://www.google.com/search?q=${encodeURIComponent(fullUrl)}`;
            }
        }

        setTabs(tabs.map(tab => {
            if (tab.id === activeTabId) {
                const newHistory = tab.history.slice(0, tab.historyIndex + 1);
                newHistory.push(fullUrl);
                return { ...tab, history: newHistory, historyIndex: newHistory.length - 1 };
            }
            return tab;
        }));
    };
    
    const handleNewTab = () => {
        const newTab: BrowserTab = {
            id: `tab-${Date.now()}`,
            history: [DEFAULT_URL],
            historyIndex: 0,
        };
        setTabs([...tabs, newTab]);
        setActiveTabId(newTab.id);
        setTabOverviewOpen(false);
    };

    const handleCloseTab = (tabIdToClose: string) => {
        const tabIndex = tabs.findIndex(t => t.id === tabIdToClose);
        if (tabIndex === -1) return;

        let newActiveTabId = activeTabId;
        if (activeTabId === tabIdToClose) {
            if (tabs.length > 1) {
                // If there's a tab before, go to it. Otherwise, go to the one after.
                newActiveTabId = tabs[tabIndex - 1]?.id || tabs[tabIndex + 1]?.id;
            } else {
                newActiveTabId = null;
            }
        }

        setTabs(tabs.filter(t => t.id !== tabIdToClose));
        setActiveTabId(newActiveTabId);
        
        if (tabs.length === 1) {
            handleNewTab(); // Always have at least one tab
        }
    };
    
    const goBack = () => {
        if (!activeTab || activeTab.historyIndex <= 0) return;
        setTabs(tabs.map(t => t.id === activeTabId ? { ...t, historyIndex: t.historyIndex - 1 } : t));
    };

    const goForward = () => {
        if (!activeTab || activeTab.historyIndex >= activeTab.history.length - 1) return;
        setTabs(tabs.map(t => t.id === activeTabId ? { ...t, historyIndex: t.historyIndex + 1 } : t));
    };

    const reload = () => {
        if (iframeRef.current) {
            iframeRef.current.src = 'about:blank';
            setTimeout(() => {
                 if (iframeRef.current) iframeRef.current.src = currentUrl;
            }, 10);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            navigate(inputValue);
            e.currentTarget.blur();
        }
    };

    const displayUrl = (url: string) => {
        try {
            const urlObj = new URL(url);
            if (urlObj.protocol.startsWith('http')) {
                return urlObj.hostname.replace('www.', '');
            }
        } catch (e) {}
        if(url.startsWith('https://www.google.com/search?q=')) return 'Google Search';
        return url;
    };
    
    const BrowserView = () => (
        <div className="h-full bg-neutral-200 flex flex-col">
            <header className="flex-shrink-0 p-2 bg-neutral-100/90 backdrop-blur-sm border-b border-neutral-300">
                <div className="flex items-center gap-2">
                    <button onClick={goBack} disabled={!activeTab || activeTab.historyIndex === 0} className="p-1.5 disabled:text-neutral-300"><ChevronLeft size={22} /></button>
                    <button onClick={goForward} disabled={!activeTab || activeTab.historyIndex >= activeTab.history.length - 1} className="p-1.5 disabled:text-neutral-300"><ChevronRight size={22} /></button>
                    <div className="flex-grow bg-neutral-200/80 rounded-lg text-sm flex items-center px-3 py-1.5">
                        <Lock size={14} className="mr-2 text-neutral-500" />
                        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} className="bg-transparent w-full focus:outline-none" />
                    </div>
                    <button onClick={reload} className="p-1.5"><RefreshCw size={18} /></button>
                </div>
                 <div className="flex items-center gap-1 mt-2 overflow-x-auto scrollbar-hide pb-1">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTabId(tab.id)} className={`flex items-center gap-1.5 py-1.5 px-3 rounded-md text-xs whitespace-nowrap transition-colors ${activeTabId === tab.id ? 'bg-white shadow-sm' : 'bg-transparent hover:bg-neutral-200/80'}`}>
                            <span className="max-w-28 truncate">{displayUrl(tab.history[tab.historyIndex])}</span>
                            <X onClick={(e) => { e.stopPropagation(); handleCloseTab(tab.id); }} size={14} className="flex-shrink-0 hover:bg-neutral-400/50 rounded-full p-0.5" />
                        </button>
                    ))}
                    <button onClick={handleNewTab} className="p-1.5 rounded-md hover:bg-neutral-200/80"><Plus size={16} /></button>
                 </div>
            </header>
            <main className="flex-grow bg-white">
                <iframe key={activeTabId} ref={iframeRef} src={currentUrl} className="w-full h-full border-none" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" title="Browser content"/>
            </main>
             <footer className="flex-shrink-0 flex justify-around items-center h-12 bg-neutral-100/90 backdrop-blur-sm border-t border-neutral-300 text-blue-500">
                 <button onClick={() => navigate(DEFAULT_URL)} className="p-2"><Home size={24} /></button>
                 <button className="p-2"><Share size={24} /></button>
                 <button onClick={() => setTabOverviewOpen(true)} className="relative p-2 flex items-center justify-center">
                    <Copy size={22}/>
                    <span className="absolute text-xs font-bold text-neutral-600 top-1/2 left-1/2 -translate-x-1/2 -translate-y-[6px]">{tabs.length}</span>
                 </button>
            </footer>
        </div>
    );
    
    const TabOverview = () => (
         <div className="h-full bg-neutral-300 flex flex-col">
             <header className="p-3 text-center border-b border-neutral-400">
                <h1 className="text-lg font-bold">Tabs</h1>
             </header>
             <div className="flex-grow p-4 overflow-y-auto grid grid-cols-2 gap-4 content-start">
                {tabs.map(tab => (
                    <div key={tab.id} onClick={() => { setActiveTabId(tab.id); setTabOverviewOpen(false); }} className="h-48 bg-white rounded-lg shadow-md p-2 flex flex-col justify-between cursor-pointer">
                        <div className="flex justify-between items-start">
                             <p className="text-sm font-semibold break-all">{displayUrl(tab.history[tab.historyIndex])}</p>
                             <button onClick={(e) => { e.stopPropagation(); handleCloseTab(tab.id); }} className="p-1 rounded-full hover:bg-neutral-200 -mt-1 -mr-1"><X size={16}/></button>
                        </div>
                         {/* Placeholder for screenshot */}
                         <div className="h-28 bg-neutral-200 rounded-sm flex items-center justify-center text-neutral-400">Preview</div>
                    </div>
                ))}
             </div>
             <footer className="flex-shrink-0 flex justify-around items-center h-12 bg-neutral-200/90 backdrop-blur-sm border-t border-neutral-300">
                <button onClick={handleNewTab} className="p-2 text-blue-500"><Plus size={28} /></button>
                <button onClick={() => setTabOverviewOpen(false)} className="px-6 py-1.5 text-blue-500 font-semibold rounded-lg">Done</button>
             </footer>
         </div>
    );
    
    return isTabOverviewOpen ? <TabOverview /> : <BrowserView />;
};

export default BrowserApp;
