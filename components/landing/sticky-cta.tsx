"use client"

import { useEffect, useState } from "react"
import { heroCopy, useLang } from "./language-switcher"

const SHOW_AFTER_SCROLL_PX = 700

export function StickyCta({ hideNearId }: { hideNearId: string }) {
  const { lang } = useLang()
  const h = heroCopy[lang]
  const [pastHero, setPastHero] = useState(false)
  const [nearFinalCta, setNearFinalCta] = useState(false)

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > SHOW_AFTER_SCROLL_PX)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const target = document.getElementById(hideNearId)
    if (!target) return
    const observer = new IntersectionObserver(([entry]) => setNearFinalCta(entry.isIntersecting))
    observer.observe(target)
    return () => observer.disconnect()
  }, [hideNearId])

  const visible = pastHero && !nearFinalCta

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-300 md:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!visible}
    >
      <a
        href="/dashboard"
        tabIndex={visible ? 0 : -1}
        className="flex min-h-12 w-full items-center justify-center rounded-lg bg-[#c41e24] px-4 py-3 text-center font-bold text-white"
      >
        {h.cta}
      </a>
    </div>
  )
}
