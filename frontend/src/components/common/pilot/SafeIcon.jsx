import { createElement, lazy, Suspense } from "react"
import { Circle } from "lucide-react"

const iconCache = new Map()

export default function SafeIcon({ name, ...props }) {
  if (!iconCache.has(name)) {
    try {
      const IconComponent = lazy(() =>
        import("lucide-react")
          .then((module) => {
            const icon = module[name]
            if (!icon) {
              console.warn(`Icon "${name}" not found in lucide-react, using fallback`)
              return { default: Circle }
            }
            return { default: icon }
          })
          .catch(() => {
            console.warn(`Failed to load icon "${name}", using fallback`)
            return { default: Circle }
          })
      )

      iconCache.set(name, IconComponent)
    } catch {
      iconCache.set(name, Circle)
    }
  }

  const Icon = iconCache.get(name) || Circle

  return (
    <Suspense fallback={<Circle {...props} />}>
      {createElement(Icon, props)}
    </Suspense>
  )
}
