/** Display names and display order for equipment types and statuses. */
import type { AssetStatus, AssetType } from '../types'

export const TYPE_ORDER: readonly AssetType[] = [
  'infusion-pump',
  'wheelchair',
  'patient-monitor',
  'ventilator',
  'hospital-bed',
  'defibrillator',
  'portable-ultrasound',
]

export const TYPE_LABEL: Record<AssetType, string> = {
  'infusion-pump': 'Infusion pump',
  wheelchair: 'Wheelchair',
  'patient-monitor': 'Patient monitor',
  ventilator: 'Ventilator',
  'hospital-bed': 'Hospital bed',
  defibrillator: 'Defibrillator',
  'portable-ultrasound': 'Portable ultrasound',
}

export const TYPE_PLURAL: Record<AssetType, string> = {
  'infusion-pump': 'Infusion pumps',
  wheelchair: 'Wheelchairs',
  'patient-monitor': 'Patient monitors',
  ventilator: 'Ventilators',
  'hospital-bed': 'Hospital beds',
  defibrillator: 'Defibrillators',
  'portable-ultrasound': 'Portable ultrasounds',
}

/** Asset ID prefix per type, e.g. "IP-104". */
export const TYPE_PREFIX: Record<AssetType, string> = {
  'infusion-pump': 'IP',
  wheelchair: 'WC',
  'patient-monitor': 'PM',
  ventilator: 'VT',
  'hospital-bed': 'HB',
  defibrillator: 'DF',
  'portable-ultrasound': 'US',
}

/** CSS color (a theme variable) for each type: map dots, legend and list icons. */
export const TYPE_COLOR: Record<AssetType, string> = {
  'infusion-pump': 'var(--color-type-infusion-pump)',
  wheelchair: 'var(--color-type-wheelchair)',
  'patient-monitor': 'var(--color-type-patient-monitor)',
  ventilator: 'var(--color-type-ventilator)',
  'hospital-bed': 'var(--color-type-hospital-bed)',
  defibrillator: 'var(--color-type-defibrillator)',
  'portable-ultrasound': 'var(--color-type-portable-ultrasound)',
}

/** Short labels for the filter chips. */
export const TYPE_SHORT: Record<AssetType, string> = {
  'infusion-pump': 'Pumps',
  wheelchair: 'Wheelchairs',
  'patient-monitor': 'Monitors',
  ventilator: 'Ventilators',
  'hospital-bed': 'Beds',
  defibrillator: 'Defibrillators',
  'portable-ultrasound': 'Ultrasounds',
}

export const STATUS_ORDER: readonly AssetStatus[] = ['in-use', 'available', 'maintenance']

export const STATUS_LABEL: Record<AssetStatus, string> = {
  'in-use': 'In use',
  available: 'Available',
  maintenance: 'In maintenance',
}

/** "Infusion pump 104" from type and ID "IP-104". */
export function assetName(type: AssetType, id: string): string {
  const number = id.split('-')[1] ?? id
  return `${TYPE_LABEL[type]} ${number}`
}
