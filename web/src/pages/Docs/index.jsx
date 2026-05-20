import React, { useState, useEffect, useCallback, useRef } from 'react';
import { marked } from 'marked';
import { Button } from '@douyinfe/semi-ui';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Docs = () => {
  const { t } = useTranslation();
  const [docs, setDocs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const articleRef = useRef(null);

  useEffect(() => {
    if (window.VIEWER_DOCS) {
      setDocs(window.VIEWER_DOCS);
      setLoading(false);
      return;
    }
    const script = document.createElement('script');
    script.src = '/docs/viewer-data.js';
    script.onload = () => {
      setDocs(window.VIEWER_DOCS || []);
      setLoading(false);
    };
    script.onerror = () => setLoading(false);
    document.head.appendChild(script);
  }, []);

  // 读取 URL 参数 -> 更新当前文档 + 滚动到顶部
  useEffect(() => {
    if (!docs.length) return;
    const docId = searchParams.get('doc');
    const idx = docId ? docs.findIndex((d) => d.id === docId) : -1;
    if (idx >= 0 && idx !== currentIndex) {
      setCurrentIndex(idx);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [searchParams, docs]);

  // currentIndex 变化 -> 同步 URL + 滚动到顶部
  useEffect(() => {
    if (!docs.length) return;
    const id = docs[currentIndex]?.id;
    if (id && searchParams.get('doc') !== id) {
      setSearchParams({ doc: id }, { replace: true });
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentIndex, docs]);

  const go = useCallback(
    (delta) => {
      setCurrentIndex((prev) => {
        const next = prev + delta;
        if (next < 0 || next >= docs.length) return prev;
        return next;
      });
    },
    [docs.length],
  );

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [go]);

  // 拦截文章内 ?doc=xxx 链接，直接用 setSearchParams 切换，不离开 /docs
  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;
    const handler = (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      const match = href.match(/[?&]doc=([^&]+)/);
      if (match) {
        e.preventDefault();
        setSearchParams({ doc: match[1] });
        setTimeout(() => {
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }, 0);
      }
    };
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  });

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64 text-semi-color-text-2'>
        {t('加载中...')}
      </div>
    );
  }

  if (!docs.length) {
    return (
      <div className='flex items-center justify-center h-64 text-semi-color-text-2'>
        {t('暂无文档内容')}
      </div>
    );
  }

  const current = docs[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < docs.length - 1;

  return (
    <div className='flex flex-col min-h-[calc(100vh-64px)]'>
      {/* Tab nav */}
      <div className='sticky top-16 z-10 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-lg border-b border-semi-color-border px-4 py-2 flex items-center gap-2 flex-wrap'>
        <nav className='flex items-center gap-1 flex-wrap flex-1 overflow-x-auto'>
          {docs.map((doc, idx) => (
            <button
              key={doc.id}
              onClick={() => setCurrentIndex(idx)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors whitespace-nowrap border ${
                idx === currentIndex
                  ? 'bg-semi-color-primary-light-default text-semi-color-primary border-semi-color-primary'
                  : 'text-semi-color-text-2 border-transparent hover:text-semi-color-primary hover:bg-semi-color-primary-light-default'
              }`}
            >
              {doc.title}
            </button>
          ))}
        </nav>
        <div className='flex items-center gap-2 flex-shrink-0'>
          <Button size='small' theme='borderless' type='tertiary' disabled={!hasPrev} onClick={() => go(-1)}>
            ← {t('上一篇')}
          </Button>
          <Button size='small' theme='borderless' type='tertiary' disabled={!hasNext} onClick={() => go(1)}>
            {t('下一篇')} →
          </Button>
        </div>
      </div>

      {/* Article */}
      <main className='flex-1 max-w-3xl mx-auto w-full px-4 py-8'>
        <article
          ref={articleRef}
          className='docs-markdown bg-semi-color-bg-1 border border-semi-color-border rounded-xl p-8 shadow-sm'
          dangerouslySetInnerHTML={{ __html: marked.parse(current.md) }}
        />
      </main>

      {/* Bottom nav */}
      <div className='sticky bottom-0 bg-semi-color-bg-0/90 backdrop-blur-lg border-t border-semi-color-border px-4 py-3 flex items-center justify-between'>
        <Button theme='borderless' type='tertiary' disabled={!hasPrev} onClick={() => go(-1)}>
          ← {t('上一篇')}
        </Button>
        <span className='text-sm text-semi-color-text-2'>
          {currentIndex + 1} / {docs.length} · {current.title}
        </span>
        <Button theme='borderless' type='tertiary' disabled={!hasNext} onClick={() => go(1)}>
          {t('下一篇')} →
        </Button>
      </div>
    </div>
  );
};

export default Docs;
