'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header, Footer, FixedMenu } from '@/components/common/navigation';
import { HomeSection, AboutSection, ContactSection } from '@/components/sections';

export default function Home() {
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const homeSectionRef = useRef<HTMLElement>(null);
  const aboutSectionRef = useRef<HTMLElement>(null);
  const contactSectionRef = useRef<HTMLElement>(null);
  const searchParams = useSearchParams();
  const [refreshChips, setRefreshChips] = useState(false);

  // URL 파라미터로 섹션 이동
  useEffect(() => {
    const section = searchParams.get('section');
    if (section === 'about' && aboutSectionRef.current) {
      aboutSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'contact' && contactSectionRef.current) {
      contactSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [searchParams]);

  // 스크롤 이벤트 리스너
  useEffect(() => {
    const handleScrollToSection = (event: CustomEvent) => {
      const section = event.detail;
      if (section === 'home' && homeSectionRef.current) {
        homeSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      } else if (section === 'about' && aboutSectionRef.current) {
        aboutSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      } else if (section === 'contact' && contactSectionRef.current) {
        contactSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

    window.addEventListener('scrollToSection', handleScrollToSection as EventListener);
    return () => {
      window.removeEventListener('scrollToSection', handleScrollToSection as EventListener);
    };
  }, []);

  const triggerRefresh = () => {
    setRefreshChips(prev => !prev);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <FixedMenu />

      <main className="flex-grow">
        <HomeSection
          ref={homeSectionRef}
          searchContainerRef={searchContainerRef}
          refreshChips={refreshChips}
          onRefresh={triggerRefresh}
        />

        <AboutSection
          ref={aboutSectionRef}
          refreshChips={refreshChips}
          onRefresh={triggerRefresh}
        />

        <ContactSection ref={contactSectionRef} />
      </main>

      <Footer />
    </div>
  );
}
