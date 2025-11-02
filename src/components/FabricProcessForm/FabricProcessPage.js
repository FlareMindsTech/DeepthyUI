import React, { useState } from "react";
import { Box, Heading } from "@chakra-ui/react";
import FabricProcessForm from "./FabricProcessForm";
import FabricProcessList from "./FabricProcessList";
import FabricProcessWatercost from "./FabricProcessWatercost";

export default function FabricProcessPage() {
  const [editData, setEditData] = useState(null);
  const [reload, setReload] = useState(false);

  const refreshList = () => {
    setReload(!reload);
    setEditData(null);
  };

  return (
    <Box p={5} marginTop={20}>
      <FabricProcessForm existingData={editData} onSuccess={refreshList} />
      <FabricProcessList key={reload} onEdit={setEditData} />
    </Box>
  );
}
