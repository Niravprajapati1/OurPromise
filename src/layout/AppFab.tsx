import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import Fab from "@mui/material/Fab";
import { styled } from "@mui/material/styles";
import React, { forwardRef } from "react";

const StyledFab = styled(Fab)({
  position: "fixed",
  top: "auto",
  right: 20,
  bottom: 20,
  left: "auto",
});

interface AppFabProps {
  forwardedRef: React.Ref<HTMLButtonElement>;
}

// mui.com/material-ui/guides/composition/#caveat-with-strictmode
// eslint-disable-next-line react/prefer-stateless-function
class AppFab extends React.Component<AppFabProps> {
  render() {
    const { forwardedRef } = this.props;
    return (
      <StyledFab
        ref={forwardedRef}
        color="primary"
        aria-label="add"
        onClick={() => {
          window.scroll({
            top: 0,
            left: 0,
            behavior: "smooth",
          });
        }}
      >
        <KeyboardArrowUp />
      </StyledFab>
    );
  }
}

export default forwardRef<HTMLButtonElement>((props, ref) => (
  <AppFab {...props} forwardedRef={ref} />
));
