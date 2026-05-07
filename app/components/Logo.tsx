export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  // Mobile-first responsive boyutlar
  const heightClasses = {
    sm: 'h-9 sm:h-10',       // 36px → 40px
    md: 'h-12 sm:h-16',      // 48px → 64px (mobile küçük, desktop büyük)
    lg: 'h-16 sm:h-24',      // 64px → 96px
  }

  return (
    <div className="logo-flame inline-block">
      <img
        src="/logo.png"
        alt="DS Diecast Satis"
        className={'select-none w-auto ' + heightClasses[size]}
        style={{ display: 'block' }}
      />
    </div>
  )
}