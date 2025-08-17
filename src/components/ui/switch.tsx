import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
      className
    )}
    style={{
      display: 'inline-flex',
      height: '24px',
      width: '44px',
      cursor: 'pointer',
      alignItems: 'center',
      borderRadius: '9999px',
      border: '2px solid transparent',
      backgroundColor: props.checked ? '#3b82f6' : '#e5e7eb',
      transition: 'all 0.2s',
      position: 'relative',
      zIndex: 1,
    }}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        'block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
      )}
      style={{
        display: 'block',
        height: '20px',
        width: '20px',
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.2s',
        transform: props.checked ? 'translateX(20px)' : 'translateX(0px)',
        pointerEvents: 'auto',
      }}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
