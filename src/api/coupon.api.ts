// Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/CouponController.java

import {MSAEndpointBuilder, MSAQueryDefinition, baseApi} from '../api';
import {
  ClientSessionVehicle,
  CouponDTO,
  NationalCoupon,
  NormalResult,
  VehicleInfoRequest,
} from '../../@types';
import {featureFlagEnabled} from '../features/menu/rules';

/**
 * Key value map returned by Java.
 *
 * Not a class; treat all as optional.
 **/
export interface CouponMap {
  dealerCoupons?: CouponDTO[];
  personalCoupons?: CouponDTO[];
  nationalCoupons?: NationalCoupon[];
  vehicle?: ClientSessionVehicle;
}

export const couponEndpoints: (builder: MSAEndpointBuilder) => {
  // NOTE: Current API doesn't require a vehicle but returns vehicle specific info
  // Including VIN for caching tag and future stateless implementation
  coupons: MSAQueryDefinition<VehicleInfoRequest, NormalResult<CouponMap>>;
} = builder => ({
  coupons: builder.query({
    extraOptions: {
      precondition: () => featureFlagEnabled('mga.offersEvents'),
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: 'coupons.json',
      method: 'GET',
      params: parameters,
    }),
  }),
});

export const couponApi = baseApi.injectEndpoints({
  endpoints: couponEndpoints,
});
export const {useCouponsQuery} = couponApi;
