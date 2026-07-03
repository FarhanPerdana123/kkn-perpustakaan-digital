import { FeaturedCollections } from "@/components/FeaturedCollections";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroSearch } from "@/components/HeroSearch";
import { MediaCategories } from "@/components/MediaCategories";
import {
  getBooks,
  getCategories,
  getFooter,
  getHeader,
  getHero,
} from "@/lib/libraryStore";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [books, categories, header, hero, footer] = await Promise.all([
    getBooks(),
    getCategories(),
    getHeader(),
    getHero(),
    getFooter(),
  ]);

  return (
    <div className="min-h-screen bg-stone-50 text-slate-950">
      <Header header={header} />
      <main>
        <HeroSearch hero={hero} />
        <MediaCategories categories={categories} />
        <FeaturedCollections books={books.slice(0, 6)} />
      </main>
      <Footer footer={footer} />
    </div>
  );
}
