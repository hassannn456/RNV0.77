import { ClientSessionVehicle } from '../../@types'
import { has } from '../features/menu/rules'

export type ShortcutType =
  | 'charge_now'
  | 'enter_service'
  | 'horn_lights'
  | 'locate'
  | 'lock'
  | 'phone'
  | 'rcc'
  | 'res'
  | 'roadside_assistance'
  | 'schedule_service'
  | 'select_retailer'
  | 'unlock'

export const getAllowedShortcutsByVehicle = (
  vehicle: ClientSessionVehicle,
): ShortcutType[] => {
  const shortcuts: ShortcutType[] = []
  if (!vehicle.provisioned) return []
  if (vehicle.stolenVehicle) return []
  if (has('res:*', vehicle)) {
    if (has({ or: ['cap:RES', 'cap:RESCC'] }, vehicle)) {
      // RES Quick Action
      shortcuts.push('res')
    } else if (has({ and: ['cap:RCC', 'cap:PHEV'] }, vehicle)) {
      // PHEV Quick Action
      shortcuts.push('rcc')
      shortcuts.push('charge_now')
    }
    // Remote Sub Quick Action
    // NOTE: Cordova has g1 and g2. They are combined here.
    {
      shortcuts.push('locate')
      shortcuts.push('lock')
      shortcuts.push('unlock')
      shortcuts.push('horn_lights')
    }
  }
  shortcuts.push('roadside_assistance')
  shortcuts.push('enter_service')
  shortcuts.push('schedule_service')
  // Safety / no sub quick actions
  if (has({ not: 'reg:HI' }, vehicle)) {
    if (vehicle.preferredDealer) {
      shortcuts.push('phone')
    } else {
      shortcuts.push('select_retailer')
    }
  }
  return shortcuts
}
