import React from "react";
import { registerComponent } from "@qorebase/custom-component-cli";
const CustomButtonQoreComponent = registerComponent("custom-button.qore.component", {
  type: "none",
  icon: "none",
  group: "text",
  defaultProps: {},
  propDefinition: {},
  Component: props => {
    return null;
  }
});
export default CustomButtonQoreComponent;