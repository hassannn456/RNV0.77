import { ClientSessionVehicle } from '../../@types'
import { gen2Plus, gen2PlusSafetyOnly, has } from '../features/menu/rules'

export const isStarlinkCommunicationSubscription: (
  key: string,
  vehicle?: ClientSessionVehicle | null,
) => boolean = (screen, vehicle) => {
  const isNonSecondaryUser = !vehicle?.authorizedVehicle
  switch (screen) {
    case 'driverServicesNotifications':
      return (
        isNonSecondaryUser &&
        has([gen2Plus, { not: 'sub:SAFETY' }, { not: 'sub:REMOTE' }], vehicle)
      )
    case 'tripTrackerNotification':
    case 'remoteVehicleControls':
    case 'vehicleMonitoring':
      return !has(gen2PlusSafetyOnly, vehicle)
    default: {
      return true
    }
  }
}
