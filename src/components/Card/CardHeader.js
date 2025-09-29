import { Box, useStyleConfig } from "@chakra-ui/react";
import React from 'react';

function CardHeader(props) {
  const { variant, children, bg, color, borderColor, ...rest } = props;
  const styles = useStyleConfig("CardHeader", { variant });

  return (
    <Box
      __css={{
        ...styles,
        bg: bg || "#C41E3A",          // Red background
        color: color || "white",       // White text
        borderBottom: `1px solid ${borderColor || "#A01830"}`, // Darker red border
        borderRadius: "8px",           // Rounded corners
        px: "16px",
        py: "12px",
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}

export default CardHeader;
