import { HeroContent } from "@/components/landing/hero-content"
import { LangProvider, LanguageSwitcher } from "@/components/landing/language-switcher"
import { PageSections } from "@/components/landing/page-sections"

export default function Page() {
  return (
    <LangProvider>
      <div className="bg-white min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center gap-3">
          <span className="font-black text-xl">ZELLOO.CH</span>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex text-xs border px-3 py-1 rounded-full">🇨🇭 Made in Switzerland</span>
            <LanguageSwitcher />
          </div>
        </div>

        <HeroContent />

        <PageSections />
      </div>
    </LangProvider>
  )
}
