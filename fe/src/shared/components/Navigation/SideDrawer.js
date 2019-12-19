import React from "react";

import "./SideDrawer.css";

const SideDrawer = props => {
  return <aside>{props.children}</aside>;
};

export default SideDrawer;
