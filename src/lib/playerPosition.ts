export type TacticalPositionCode =
  | 'GK'
  | 'RB'
  | 'RCB'
  | 'CB'
  | 'LCB'
  | 'LB'
  | 'DM'
  | 'RCM'
  | 'CM'
  | 'LCM'
  | 'AM'
  | 'RW'
  | 'LW'
  | 'ST'

export type TacticalPositionOption = {
  code: TacticalPositionCode
  label: string
}

export const TACTICAL_POSITION_OPTIONS: TacticalPositionOption[] = [
  { code: 'GK', label: 'Brankář' },
  { code: 'RB', label: 'Pravý obránce' },
  { code: 'RCB', label: 'Pravý stoper' },
  { code: 'CB', label: 'Stoper' },
  { code: 'LCB', label: 'Levý stoper' },
  { code: 'LB', label: 'Levý obránce' },
  { code: 'DM', label: 'Defenzivní záložník' },
  { code: 'RCM', label: 'Pravý střední záložník' },
  { code: 'CM', label: 'Střední záložník' },
  { code: 'LCM', label: 'Levý střední záložník' },
  { code: 'AM', label: 'Ofenzivní záložník' },
  { code: 'RW', label: 'Pravé křídlo' },
  { code: 'LW', label: 'Levé křídlo' },
  { code: 'ST', label: 'Útočník' },
]

const aliasMap = new Map<string, TacticalPositionCode>([
  ['gk', 'GK'],
  ['goalkeeper', 'GK'],
  ['brankar', 'GK'],
  ['rb', 'RB'],
  ['right back', 'RB'],
  ['pravy obrance', 'RB'],
  ['rcb', 'RCB'],
  ['pravy stoper', 'RCB'],
  ['cb', 'CB'],
  ['centre back', 'CB'],
  ['center back', 'CB'],
  ['stoper', 'CB'],
  ['obrance', 'CB'],
  ['lcb', 'LCB'],
  ['levy stoper', 'LCB'],
  ['lb', 'LB'],
  ['left back', 'LB'],
  ['levy obrance', 'LB'],
  ['dm', 'DM'],
  ['cdm', 'DM'],
  ['defenzivni zaloznik', 'DM'],
  ['rcm', 'RCM'],
  ['pravy stredni zaloznik', 'RCM'],
  ['cm', 'CM'],
  ['stredni zaloznik', 'CM'],
  ['zaloznik', 'CM'],
  ['lcm', 'LCM'],
  ['levy stredni zaloznik', 'LCM'],
  ['am', 'AM'],
  ['cam', 'AM'],
  ['ofenzivni zaloznik', 'AM'],
  ['rw', 'RW'],
  ['prave kridlo', 'RW'],
  ['right wing', 'RW'],
  ['lw', 'LW'],
  ['leve kridlo', 'LW'],
  ['left wing', 'LW'],
  ['st', 'ST'],
  ['cf', 'ST'],
  ['fw', 'ST'],
  ['utocnik', 'ST'],
  ['striker', 'ST'],
  ['forward', 'ST'],
])

function normalize(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('cs-CZ')
    .trim()
    .replace(/\s+/g, ' ')
}

export function normalizeTacticalPosition(
  value: string | null | undefined,
): TacticalPositionCode | null {
  if (!value) return null

  const upper = value.trim().toUpperCase()
  if (TACTICAL_POSITION_OPTIONS.some((option) => option.code === upper)) {
    return upper as TacticalPositionCode
  }

  return aliasMap.get(normalize(value)) ?? null
}

export function tacticalPositionLabel(value: string | null | undefined) {
  const code = normalizeTacticalPosition(value)
  if (!code) return value || null
  return TACTICAL_POSITION_OPTIONS.find((option) => option.code === code)?.label ?? code
}

export function tacticalPositionPoint(
  value: string | null | undefined,
): { x: number; y: number } | null {
  const code = normalizeTacticalPosition(value)
  if (!code) return null

  switch (code) {
    case 'GK':
      return { x: 50, y: 89 }
    case 'RB':
      return { x: 84, y: 67 }
    case 'RCB':
      return { x: 63, y: 67 }
    case 'CB':
      return { x: 50, y: 67 }
    case 'LCB':
      return { x: 37, y: 67 }
    case 'LB':
      return { x: 16, y: 67 }
    case 'DM':
      return { x: 50, y: 54 }
    case 'RCM':
      return { x: 68, y: 43 }
    case 'CM':
      return { x: 50, y: 43 }
    case 'LCM':
      return { x: 32, y: 43 }
    case 'AM':
      return { x: 50, y: 31 }
    case 'RW':
      return { x: 73, y: 19 }
    case 'LW':
      return { x: 27, y: 19 }
    case 'ST':
      return { x: 50, y: 17 }
  }
}
