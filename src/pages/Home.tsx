import { useRef } from 'react';
import { HomeHero, StellarBackdrop } from '@/components/cosmic/StellarSequence';
import { CommunitySection, EventsSection, ExploreSection, FeaturedSection, GallerySection, NewsSection } from '@/components/home/Sections';
import { useDocumentTitle } from '@/hooks/dom';

export default function Home() {
  useDocumentTitle('Explore os mistérios do Universo');
  const track = useRef<HTMLDivElement>(null);
  return (
    <>
      {/* The star's life cycle plays behind the page as you scroll */}
      <StellarBackdrop track={track} />
      <div ref={track} className="relative z-10">
        <HomeHero />
        <FeaturedSection />
        <ExploreSection />
        <NewsSection />
        <EventsSection />
        <GallerySection />
        <CommunitySection />
      </div>
    </>
  );
}
