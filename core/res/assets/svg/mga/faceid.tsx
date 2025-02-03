import * as React from "react";
import Svg, { Path, G, Circle, Rect, Ellipse, Line, Polyline, Polygon } from "react-native-svg";

const Faceid = (props) => (
  <Svg
    viewBox="0 0 240 83"
    {...props}
  >
    <Path d="M1.6299,8.5947c0.2319,0,0.4585-0.0942,0.6211-0.2573C2.415,8.1738,2.5093,7.9473,2.5093,7.7153V4.9834  C2.5039,4.6548,2.5635,4.334,2.6865,4.0303c0.1235-0.3042,0.3037-0.5762,0.5356-0.8081s0.5039-0.4121,0.8081-0.5356  c0.3042-0.123,0.6392-0.1812,0.957-0.1772h2.728c0.2319,0,0.4585-0.0942,0.6211-0.2573c0.1641-0.1636,0.2583-0.3901,0.2583-0.6221  c0-0.2349-0.0918-0.4561-0.2573-0.6216C8.1738,0.8442,7.9473,0.75,7.7153,0.75H4.9897C4.4321,0.748,3.8799,0.8491,3.3604,1.0605  c-0.5205,0.2119-0.9854,0.521-1.3818,0.918c-0.397,0.3965-0.7061,0.8613-0.918,1.3818C0.8486,3.8799,0.7441,4.4282,0.75,4.9873  v2.728c0,0.2319,0.0942,0.4585,0.2578,0.6216C1.1738,8.5029,1.395,8.5947,1.6299,8.5947z" />
    <Path d="M24.9395,3.3604c-0.2119-0.519-0.5205-0.9844-0.918-1.3823c-0.3965-0.3965-0.8613-0.7056-1.3818-0.9175  c-0.5195-0.2119-1.0596-0.3052-1.627-0.3105h-2.7275c-0.2354,0-0.4561,0.0918-0.6221,0.2573  c-0.1641,0.1636-0.2578,0.3901-0.2578,0.6221c0,0.2349,0.0918,0.4561,0.2578,0.6221s0.3867,0.2573,0.6221,0.2573h2.7314  c0.3574-0.0083,0.6494,0.0547,0.9531,0.1777s0.5762,0.3032,0.8086,0.5352c0.2324,0.2329,0.4121,0.5044,0.5352,0.8081  c0.123,0.3062,0.1826,0.6265,0.1777,0.957v2.728c0,0.2354,0.0908,0.4565,0.2568,0.6221c0.166,0.166,0.3867,0.2573,0.6221,0.2573  s0.4561-0.0913,0.6221-0.2573S25.25,7.9497,25.25,7.7148V4.9897C25.2559,4.4292,25.1514,3.8809,24.9395,3.3604z" />
    <Path d="M7.7153,23.4912H4.9834c-0.3457-0.0049-0.6499-0.0547-0.9531-0.1777c-0.3037-0.123-0.5752-0.3027-0.8081-0.5352  c-0.2329-0.2334-0.4131-0.5049-0.5356-0.8086c-0.123-0.3037-0.1826-0.624-0.1772-0.957v-2.7275  c0-0.1172-0.0225-0.2305-0.0669-0.3369c-0.0449-0.1074-0.1089-0.2031-0.1909-0.2852c-0.0811-0.0811-0.1768-0.1455-0.2866-0.1914  c-0.3159-0.1279-0.71-0.0537-0.957,0.1914c-0.166,0.166-0.2578,0.3867-0.2578,0.6221v2.7246  c-0.0059,0.5625,0.0991,1.1104,0.311,1.6299c0.2114,0.5186,0.5205,0.9834,0.918,1.3818c0.3965,0.3965,0.8613,0.7051,1.3818,0.917  c0.5059,0.2061,1.0381,0.3105,1.5796,0.3105c0.0156,0,0.0312,0,0.0469,0h2.728c0.1143,0,0.2271-0.0225,0.3354-0.0664  c0.1069-0.0439,0.2031-0.1084,0.2856-0.1904c0.0801-0.0801,0.146-0.1787,0.1909-0.2861c0.0444-0.1064,0.0669-0.2197,0.0669-0.3359  c0-0.2344-0.0913-0.4551-0.2578-0.623C8.1719,23.585,7.9458,23.4912,7.7153,23.4912z" />
    <Path d="M23.748,17.6631c-0.166,0.166-0.2568,0.3867-0.2568,0.6221v2.7314c0.0049,0.3271-0.0547,0.6484-0.1777,0.9531  c-0.123,0.3027-0.3027,0.5752-0.5352,0.8086c-0.2334,0.2324-0.5059,0.4121-0.8086,0.5352c-0.3057,0.123-0.6289,0.1729-0.957,0.1777  h-2.7275c-0.2354,0-0.4561,0.0908-0.6221,0.2568s-0.2578,0.3867-0.2578,0.6221s0.0918,0.4561,0.2578,0.6221  s0.3867,0.2578,0.6221,0.2578h2.7246c0.0156,0,0.0322,0,0.0479,0c0.5439,0,1.0752-0.1045,1.582-0.3105  c0.5195-0.2119,0.9844-0.5205,1.3818-0.918s0.7061-0.8623,0.918-1.3818c0.2119-0.5215,0.3164-1.0693,0.3105-1.627v-2.7275  c0-0.2354-0.0918-0.4561-0.2578-0.6221C24.6602,17.3311,24.0801,17.3311,23.748,17.6631z" />
    <Path d="M7.5068,9.4277C7.3486,9.5967,7.2622,9.8257,7.269,10.0571v1.7373c-0.0078,0.2329,0.0786,0.4639,0.2378,0.6333  c0.1611,0.1729,0.3799,0.2729,0.6328,0.2812c0.2324-0.0083,0.457-0.1108,0.6157-0.2808c0.1582-0.1694,0.2451-0.3999,0.2378-0.625  V10.061C9.0005,9.8247,8.916,9.5996,8.7554,9.4282C8.5967,9.2578,8.3721,9.1553,8.1221,9.147  C7.8867,9.1553,7.668,9.2554,7.5068,9.4277z" />
    <Path d="M18.0254,12.709c0.2344-0.0083,0.4531-0.1079,0.6152-0.2812c0.1592-0.1699,0.2451-0.4009,0.2373-0.6245V10.062  c0.0078-0.2329-0.0781-0.4639-0.2373-0.6343c-0.1621-0.1729-0.3809-0.2725-0.6328-0.2808  c-0.2354,0.0083-0.4541,0.1079-0.6162,0.2812c-0.1582,0.1689-0.2441,0.3979-0.2373,0.6289v1.7373  c-0.0078,0.2324,0.0781,0.4634,0.2373,0.6338C17.5537,12.6011,17.7725,12.7007,18.0254,12.709z" />
    <Path d="M17.6807,18.6016c0.0469-0.1064,0.0732-0.2188,0.0791-0.3408c0.0029-0.1162-0.0166-0.2305-0.0566-0.3408  c-0.041-0.1113-0.1035-0.2119-0.1836-0.2959c-0.0791-0.0859-0.1748-0.1553-0.2832-0.2051  c-0.1074-0.0488-0.2217-0.0762-0.3398-0.0801c-0.1299,0.0029-0.2314,0.0156-0.3438,0.0566c-0.1094,0.04-0.209,0.1016-0.2959,0.1816  C15.3652,18.3936,14.209,18.8428,13,18.8428c-1.2085,0-2.3657-0.4492-3.2559-1.2637c-0.1724-0.1611-0.4102-0.2373-0.6406-0.2402  c-0.2354,0.0078-0.4624,0.1123-0.6226,0.2842c-0.1606,0.1719-0.248,0.4053-0.2402,0.6406c0.0083,0.2363,0.1118,0.4639,0.2837,0.623  l0.0015,0.002c1.2236,1.123,2.813,1.7422,4.4741,1.7422s3.25-0.6191,4.4746-1.7432C17.5615,18.8076,17.6299,18.7119,17.6807,18.6016  z" />
    <Path d="M12.5708,14.6885h-0.4277c-0.1182,0-0.2329,0.0225-0.3418,0.0674c-0.1104,0.0459-0.208,0.1113-0.2905,0.1943  s-0.1479,0.1797-0.1938,0.29c-0.0449,0.1094-0.0679,0.2246-0.0679,0.3418s0.0229,0.2324,0.0684,0.3428  c0.0454,0.1094,0.1108,0.2061,0.1929,0.2881c0.083,0.084,0.1807,0.1494,0.291,0.1953c0.1089,0.0449,0.2236,0.0674,0.3418,0.0674  h0.418c0.0254,0.001,0.0503,0.001,0.0752,0.001c0.2383,0,0.4712-0.0439,0.6938-0.1309c0.2466-0.0957,0.4663-0.2393,0.6523-0.4268  c0.1865-0.1855,0.3311-0.4053,0.4277-0.6523c0.0967-0.2461,0.1406-0.5049,0.1309-0.7588V9.998c0-0.2388-0.0928-0.4634-0.2617-0.6328  c-0.3398-0.3369-0.9253-0.3379-1.2651,0.001c-0.1421,0.1426-0.2305,0.3247-0.2544,0.5215l-0.0078,4.7988L12.5708,14.6885z" />
  </Svg>
);

export default Faceid;
