/* eslint-disable no-undef */
const fs = require('fs');
const src_dir = 'content/svg/mga';
const out_dir = 'icons';

const upperFirst = v => {
  return v.slice(0, 1).toUpperCase() + v.slice(1, v.length);
};

const snakeToPascal = v => {
  return v
    .toLowerCase()
    .replace('.svg', '')
    .split(/[\W_]+/)
    .map(str => upperFirst(str))
    .join('');
};

templateString = `import React from 'react'
import { CsfIconHelper, Size } from '../src/components/CsfIconHelper'
import Svg from '../content/svg/mga/##########'
import { CsfColorPalette } from '../src/components/useCsfColors'
import { testID } from '../src/components/utils/testID'
const Icon: React.FC<{
  size?: Size
  color?: keyof CsfColorPalette
  testID?: string
}> = props => {
  const id = testID(props.testID)
  return (
    <CsfIconHelper>
      {({ colors, getSize }) => (
        <Svg
          width={props.size && getSize ? getSize(props.size) : 24}
          height={props.size && getSize ? getSize(props.size) : 24}
          testID={id()}
          fill={
            colors && props.color
              ? colors[props.color]
              : colors?.copyPrimary || '#000'
          }
        />
      )}
    </CsfIconHelper>
  )
}

export default Icon`;

let indexImport = '';
let indexExport = '';

if (!fs.existsSync(out_dir)) {
  fs.mkdirSync(out_dir);
}
// get contents of icons dir
const files = fs.readdirSync(src_dir);
for (const file of files) {
  // destination file name
  const pc = snakeToPascal(file);
  const pcFile = pc + '.tsx';
  // find SVGs which haven't been converted already (maybe we don't care, tbd)
  if (file.endsWith('.svg')) {
    // replace import file name
    const svgString = templateString.replace('##########', file);

    indexImport = `${indexImport}import ${pc} from './${pc}'\n`;
    indexExport = `${indexExport}${pc},\n`;
    // write to icons component dir
    fs.writeFileSync(`${out_dir}/${pcFile}`, svgString);
  }
}

const types = `export type CsfIcon = ${files
  .map(file => {
    return `'${snakeToPascal(file)}'`;
  })
  .join(' | ')}`;

fs.writeFileSync(
  `${out_dir}/index.ts`,
  `${indexImport}\n\nexport{\n${indexExport}}\n${types}`,
);
