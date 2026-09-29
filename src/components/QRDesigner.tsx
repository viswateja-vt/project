import {
  Check,
  Image as ImageIcon,
  Palette,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import type { QRDesign } from '../lib/qrTypes';
import { DEFAULT_QR_DESIGN } from '../lib/qrTypes';

interface QRDesignerProps {
  design: QRDesign;
  onChange: (design: QRDesign) => void;
}

const PATTERNS = [
  { value: 'square', label: 'Square' },
  { value: 'dots', label: 'Dots' },
  { value: 'rounded', label: 'Rounded' },
];

const EYES = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'dot', label: 'Dot' },
];

const ERROR_LEVELS = [
  {
    value: 'L',
    label: 'Low',
    description: '7%',
  },
  {
    value: 'M',
    label: 'Medium',
    description: '15%',
  },
  {
    value: 'Q',
    label: 'High',
    description: '25%',
  },
  {
    value: 'H',
    label: 'Maximum',
    description: '30%',
  },
];

export function QRDesigner({
  design,
  onChange,
}: QRDesignerProps) {
  function update(
    updates: Partial<QRDesign>
  ) {
    onChange({
      ...design,
      ...updates,
    });
  }

  function resetDesign() {
    onChange({
      ...DEFAULT_QR_DESIGN,
    });
  }

  return (
    <div className="space-y-6">
      {/* Colors */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <SectionHeader
          icon={<Palette size={18} />}
          title="Colors"
          description="Choose the QR foreground and background."
        />

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <ColorField
            label="Foreground"
            value={design.foregroundColor}
            onChange={(foregroundColor) =>
              update({
                foregroundColor,
              })
            }
          />

          <ColorField
            label="Background"
            value={design.backgroundColor}
            onChange={(backgroundColor) =>
              update({
                backgroundColor,
              })
            }
          />
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
            Gradient
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleCard
              active={!design.gradient}
              label="Solid color"
              preview={
                <div
                  className="h-8 w-full rounded-lg"
                  style={{
                    backgroundColor:
                      design.foregroundColor,
                  }}
                />
              }
              onClick={() =>
                update({
                  gradient: false,
                })
              }
            />

            <ToggleCard
              active={Boolean(
                design.gradient
              )}
              label="Gradient"
              preview={
                <div
                  className="h-8 w-full rounded-lg"
                  style={{
                    background: `linear-gradient(90deg, ${design.foregroundColor}, ${design.gradientColor || design.foregroundColor})`,
                  }}
                />
              }
              onClick={() =>
                update({
                  gradient: true,
                })
              }
            />
          </div>
        </div>

        {design.gradient && (
          <div className="mt-4">
            <ColorField
              label="Gradient color"
              value={
                design.gradientColor ||
                design.foregroundColor
              }
              onChange={(gradientColor) =>
                update({
                  gradientColor,
                })
              }
            />
          </div>
        )}
      </section>

      {/* Pattern */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <SectionHeader
          icon={<Sparkles size={18} />}
          title="Style"
          description="Customize the QR modules and finder eyes."
        />

        <div className="mt-5">
          <label className="mb-3 block text-sm font-semibold text-slate-800 dark:text-slate-200">
            Pattern
          </label>

          <div className="grid grid-cols-3 gap-3">
            {PATTERNS.map((pattern) => (
              <StyleChoice
                key={pattern.value}
                label={pattern.label}
                active={
                  design.pattern ===
                  pattern.value
                }
                onClick={() =>
                  update({
                    pattern:
                      pattern.value,
                  })
                }
              >
                <PatternPreview
                  type={pattern.value}
                  color={
                    design.foregroundColor
                  }
                />
              </StyleChoice>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-3 block text-sm font-semibold text-slate-800 dark:text-slate-200">
            Eye style
          </label>

          <div className="grid grid-cols-3 gap-3">
            {EYES.map((eye) => (
              <StyleChoice
                key={eye.value}
                label={eye.label}
                active={
                  design.eyeStyle ===
                  eye.value
                }
                onClick={() =>
                  update({
                    eyeStyle:
                      eye.value,
                  })
                }
              >
                <EyePreview
                  type={eye.value}
                  color={
                    design.foregroundColor
                  }
                />
              </StyleChoice>
            ))}
          </div>
        </div>
      </section>

      {/* Logo */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <SectionHeader
          icon={<ImageIcon size={18} />}
          title="Logo"
          description="Add a brand mark to the center of your QR."
        />

        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
            Logo URL
          </label>

          <input
            type="url"
            value={design.logo || ''}
            onChange={(event) =>
              update({
                logo:
                  event.target.value ||
                  undefined,
              })
            }
            placeholder="https://example.com/logo.png"
            className={inputClassName}
          />

          <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Use a publicly accessible PNG, JPG, SVG, or WebP image.
          </p>

          {design.logo && (
            <div className="mt-4 flex items-center gap-4 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                <img
                  src={design.logo}
                  alt="QR logo preview"
                  className="max-h-full max-w-full object-contain"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      'none';
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Logo enabled
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {design.logo}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  update({
                    logo: undefined,
                  })
                }
                className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Size & quality */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <SectionHeader
          icon={<Sparkles size={18} />}
          title="Quality"
          description="Control output size, quiet zone, and error recovery."
        />

        <div className="mt-5 space-y-6">
          <RangeField
            label="Size"
            value={design.size}
            min={128}
            max={2048}
            step={64}
            display={`${design.size}px`}
            onChange={(size) =>
              update({
                size,
              })
            }
          />

          <RangeField
            label="Quiet zone"
            value={design.margin}
            min={0}
            max={16}
            step={1}
            display={`${design.margin} modules`}
            onChange={(margin) =>
              update({
                margin,
              })
            }
          />

          <div>
            <label className="mb-3 block text-sm font-semibold text-slate-800 dark:text-slate-200">
              Error correction
            </label>

            <div className="grid grid-cols-4 gap-2">
              {ERROR_LEVELS.map(
                (level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() =>
                      update({
                        errorCorrection:
                          level.value as QRDesign['errorCorrection'],
                      })
                    }
                    className={[
                      'rounded-xl border px-2 py-3 text-center transition',
                      design.errorCorrection ===
                      level.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/50 dark:text-indigo-300'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-slate-600',
                    ].join(' ')}
                  >
                    <span className="block text-sm font-bold">
                      {level.value}
                    </span>
                    <span className="mt-0.5 block text-[10px]">
                      {level.description}
                    </span>
                  </button>
                )
              )}
            </div>

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Higher correction improves readability when the QR
              contains a logo or may be partially damaged.
            </p>
          </div>
        </div>
      </section>

      {/* Reset */}
      <button
        type="button"
        onClick={resetDesign}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800"
      >
        <RotateCcw size={16} />
        Reset design
      </button>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-950 dark:text-white">
          {title}
        </h3>

        <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
        {label}
      </span>

      <div className="flex gap-2">
        <input
          type="color"
          value={normalizeColor(value)}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="h-11 w-14 cursor-pointer rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-950"
          aria-label={label}
        />

        <input
          type="text"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={`${inputClassName} font-mono uppercase`}
          placeholder="#111827"
        />
      </div>
    </label>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {label}
        </label>

        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {display}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) =>
          onChange(
            Number(event.target.value)
          )
        }
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600 dark:bg-slate-700"
      />

      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function StyleChoice({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'relative rounded-xl border p-2.5 text-left transition',
        active
          ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/50'
          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-slate-600',
      ].join(' ')}
    >
      {active && (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
          <Check size={12} />
        </span>
      )}

      <div className="flex h-16 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-900">
        {children}
      </div>

      <span className="mt-2 block text-center text-[11px] font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </span>
    </button>
  );
}

function ToggleCard({
  label,
  active,
  preview,
  onClick,
}: {
  label: string;
  active: boolean;
  preview: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-xl border p-3 text-left transition',
        active
          ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/40'
          : 'border-slate-200 dark:border-slate-700',
      ].join(' ')}
    >
      {preview}

      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </span>

        {active && (
          <Check
            size={14}
            className="text-indigo-600 dark:text-indigo-400"
          />
        )}
      </div>
    </button>
  );
}

function PatternPreview({
  type,
  color,
}: {
  type: string;
  color: string;
}) {
  const dots = Array.from(
    { length: 25 },
    (_, index) => index
  );

  return (
    <div className="grid h-12 w-12 grid-cols-5 gap-[2px]">
      {dots.map((index) => {
        const active =
          type === 'dots'
            ? index % 2 === 0 ||
              index % 5 === 0
            : type === 'rounded'
              ? index % 3 !== 1
              : index % 4 !== 1;

        return (
          <span
            key={index}
            className={[
              'block',
              type === 'dots'
                ? 'rounded-full'
                : type === 'rounded'
                  ? 'rounded-[3px]'
                  : 'rounded-none',
            ].join(' ')}
            style={{
              backgroundColor:
                active
                  ? color
                  : 'transparent',
            }}
          />
        );
      })}
    </div>
  );
}

function EyePreview({
  type,
  color,
}: {
  type: string;
  color: string;
}) {
  return (
    <div
      className={[
        'relative h-11 w-11 border-[5px]',
        type === 'rounded'
          ? 'rounded-xl'
          : type === 'dot'
            ? 'rounded-full'
            : 'rounded-none',
      ].join(' ')}
      style={{
        borderColor: color,
      }}
    >
      <div
        className={[
          'absolute inset-2',
          type === 'rounded'
            ? 'rounded-md'
            : type === 'dot'
              ? 'rounded-full'
              : 'rounded-none',
        ].join(' ')}
        style={{
          backgroundColor: color,
        }}
      />
    </div>
  );
}

function normalizeColor(
  value: string
) {
  if (
    /^#[0-9a-f]{6}$/i.test(
      value
    )
  ) {
    return value;
  }

  return '#111827';
}

const inputClassName =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/10';