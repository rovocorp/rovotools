import React from "react";
import { Redirect, useLocalSearchParams } from "expo-router";

// Legacy nested route: canonical tool screens live at /tools/[id].
export default function LegacyToolRedirect(): React.ReactElement {
  const { toolId } = useLocalSearchParams<{ toolId?: string }>();
  const id = Array.isArray(toolId) ? toolId[0] : toolId;
  return <Redirect href={`/tools/${id ?? ""}`} />;
}
