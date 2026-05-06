export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const heights = { sm: 50, md: 150, lg: 120 }

  return (
    <img
      src="/logo.png"
      alt="DS Diecast Satis"
      style={{ height: heights[size], width: 'auto' }}
      className="select-none"
    />
  )
}