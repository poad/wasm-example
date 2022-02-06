import React, { useState } from "react";
import type { NextPage } from 'next'
import { sums } from "../../wasm/pkg/wasm_bg.wasm";

const Home: NextPage = () => {

  const [value, setValue] = useState(0);
  
  return (
    <div>
      <input
        onChange={(e) => {
          const v = Number(e.target.value);
          !isNaN(v) && setValue(sums(v));
        }}
      />
      <div>{value}</div>
    </div>
  );
}

export default Home
