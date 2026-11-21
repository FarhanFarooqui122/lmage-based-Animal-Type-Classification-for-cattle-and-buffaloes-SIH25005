import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-none border-2 border-foreground bg-clip-padding text-[0.8125rem] font-bold uppercase tracking-wide whitespace-nowrap transition-all outline-none select-none shadow-[3px_3px_0_0_var(--foreground)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--foreground)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        outline: 'bg-card text-foreground hover:bg-secondary',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-accent',
        ghost:
          'border-transparent bg-transparent shadow-none hover:border-foreground hover:bg-secondary hover:shadow-none',
        destructive: 'bg-destructive text-white',
        link: 'border-transparent bg-transparent shadow-none underline underline-offset-4 hover:no-underline hover:shadow-none',
      },
      size: {
        default: 'h-10 px-4',
        xs: 'h-7 px-2 text-[0.7rem]',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-sm',
        icon: 'size-10',
        'icon-xs': 'size-7 [&_svg:not([class*="size-"])]:size-3',
        'icon-sm': 'size-8 [&_svg:not([class*="size-"])]:size-3.5',
        'icon-lg': 'size-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
