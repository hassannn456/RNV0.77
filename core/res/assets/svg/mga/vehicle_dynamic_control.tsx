import * as React from "react";
import Svg, { Path, G, Circle, Rect, Ellipse, Line, Polyline, Polygon } from "react-native-svg";

const VehicleDynamicControl = (props) => (
  <Svg
    viewBox="0 0 240 83"
    {...props}
  >
    <G />
    <Path d="M15.9749756,8.4958496c-0.0966797-0.0979004-0.2122803-0.1749268-0.3399048-0.2263794   c-0.1274414-0.0514526-0.2642822-0.0762329-0.4017944-0.0728149c-0.1374512-0.003418-0.2741699,0.0213623-0.4017944,0.0728149   c-0.1275024,0.0514526-0.2431641,0.128479-0.3397827,0.2263794c-0.0979004,0.0967407-0.1749878,0.2125854-0.2265015,0.340271   c-0.0513916,0.1277466-0.0761719,0.2645874-0.0726929,0.4021606c-0.003418,0.1375122,0.0214233,0.274292,0.0728149,0.4018555   c0.0514526,0.1275635,0.128479,0.2432251,0.2263794,0.3398438c0.0968018,0.0975342,0.2125244,0.1743164,0.3400269,0.2254028   c0.1275635,0.0512085,0.2642822,0.0757446,0.4015503,0.0721436v0.0016479   c0.1375122,0.003418,0.274353-0.0213623,0.4017944-0.072876c0.1276245-0.0513916,0.2432251-0.128479,0.3399048-0.2263184   c0.0979004-0.0966187,0.1749268-0.2122803,0.2263184-0.3398438c0.0515137-0.1275635,0.0762939-0.2643433,0.072937-0.4018555   c0.003479-0.1375732-0.0213013-0.2744751-0.0727539-0.4022217C16.1500244,8.708374,16.072998,8.5925903,15.9749756,8.4958496z" />
    <Path d="M9.4291382,8.4958496C9.3325195,8.3979492,9.2168579,8.3209229,9.0892944,8.2694702S8.8250122,8.1932373,8.6875,8.1966553   c-0.1375122-0.003418-0.274231,0.0213623-0.4017944,0.0728149s-0.2432251,0.128479-0.3399048,0.2263794   C7.8479004,8.5925903,7.770874,8.7084351,7.7194214,8.8361206C7.6679688,8.9638672,7.6431885,9.100708,7.6466675,9.2382812   c-0.003418,0.1375122,0.0213623,0.274292,0.0728149,0.4018555s0.128479,0.2432251,0.2263184,0.3398438   c0.0968018,0.0975342,0.2125854,0.1743164,0.3400879,0.2254028c0.1275635,0.0512085,0.2642212,0.0757446,0.4016113,0.0721436   v0.0016479c0.1375122,0.003418,0.274231-0.0213623,0.4017944-0.072876c0.1275635-0.0513916,0.2432251-0.128479,0.3398438-0.2263184   c0.0979004-0.0966187,0.1749268-0.2122803,0.2263794-0.3398438s0.0762329-0.2643433,0.0728149-0.4018555   c0.003479-0.1375732-0.0213013-0.2744141-0.0727539-0.4021606C9.604126,8.7084351,9.5270996,8.5925903,9.4291382,8.4958496z" />
    <Path d="M5.8516846,13.9299927c0.0545654,0.0545044,0.1196289,0.09729,0.1912231,0.1259766   c0.0716553,0.0286255,0.1483154,0.0425415,0.2254028,0.0407104h0.4758301   c0.0771484,0.0018311,0.1538086-0.012085,0.2254028-0.0407104c0.0716553-0.0286865,0.1367188-0.0714722,0.1912842-0.1259766   c0.0545044-0.0545654,0.0973511-0.1195679,0.1259766-0.1912842c0.0286865-0.0715942,0.0424805-0.1483154,0.0407104-0.2254028   v-1.1732788h9.2816772v1.1732788c-0.00177,0.0770874,0.0120239,0.1538086,0.0405884,0.2254028   c0.0287476,0.0717163,0.0715332,0.1367188,0.1260376,0.1912842c0.0545654,0.0545044,0.1196899,0.09729,0.1912842,0.1259766   c0.0715942,0.0286255,0.1483154,0.0425415,0.2254028,0.0407104h0.475769   c0.0771484,0.0018311,0.1538086-0.012085,0.2254028-0.0407104c0.0715942-0.0286865,0.1367188-0.0714722,0.1913452-0.1259766   c0.0545044-0.0545654,0.0973511-0.1195679,0.1259766-0.1912842c0.0286255-0.0715942,0.0424805-0.1483154,0.0407104-0.2254028   V7.3016968l-1.5258789-4.3591919c-0.0537109-0.1477661-0.1529541-0.2746582-0.2833252-0.3624878   c-0.1445923-0.0980835-0.3162231-0.1481934-0.4907837-0.1433716H7.9691772   c-0.1729736-0.0085449-0.34375,0.0420532-0.4841919,0.1433716C7.3619995,2.6769409,7.2630005,2.8010254,7.1958008,2.9425049   L5.6699829,7.3016968v6.2116089c0.0001221,0.078186,0.0163574,0.1555176,0.0476074,0.2271729   C5.7488403,13.8121948,5.7944336,13.876709,5.8516846,13.9299927z M8.3175049,3.7550049h7.2932739l0.8583984,2.4649658H7.4550171   L8.3175049,3.7550049z M6.9874878,7.5375366h9.9458008v3.4857788H6.9874878V7.5375366z" />
    <Path d="M18.2532959,18.498291c0.0756226-0.0424805,0.1408081-0.1010132,0.1912842-0.1715088   c0.050415-0.0703735,0.0848389-0.151062,0.100708-0.2362061c0.0159302-0.0852051,0.0129395-0.1727905-0.008667-0.2567749   c-0.0217285-0.0839233-0.0615234-0.1619873-0.1166382-0.2288208l-1.939209-2.3491821h-1.8282471l2.0249634,2.4291992   l-1.2108154,0.6375122c-0.0756836,0.0424194-0.1410522,0.1010132-0.1915894,0.1715088   c-0.0505981,0.0704956-0.0849609,0.1513062-0.1008911,0.2365723c-0.0158691,0.0853271-0.0128784,0.1730347,0.0089111,0.257019   c0.0216675,0.0839844,0.0615845,0.1621704,0.1168823,0.2290039l1.9432983,2.3483887h1.8300171l-2.0300293-2.4284058   L18.2532959,18.498291z" />
    <Path d="M8.6049805,18.498291c0.0755615-0.0424805,0.1408081-0.1010132,0.1912842-0.1715088   c0.050415-0.0703735,0.0848389-0.151062,0.100708-0.2362061c0.0158691-0.0852051,0.0128784-0.1727905-0.008728-0.2567749   c-0.0216675-0.0839233-0.0614624-0.1619873-0.1165771-0.2288208L6.831665,15.2557983H5.0033569l2.0299683,2.4282837   l-1.2108154,0.6384277c-0.0755005,0.0424194-0.1408081,0.1010132-0.1912842,0.1713867   c-0.050415,0.0704956-0.0847778,0.151123-0.100708,0.2363281c-0.0158691,0.085144-0.0128784,0.1727905,0.008728,0.2566528   c0.0216675,0.0839233,0.0614624,0.1620483,0.1165771,0.2289429l1.9391479,2.3491821h1.8292236L7.394165,19.1365967   L8.6049805,18.498291z" />
  </Svg>
);

export default VehicleDynamicControl;
