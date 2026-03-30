import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

const SIDEBAR_WIDTH = 240;
const TOPBAR_HEIGHT = 64;

export function AppLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar width={SIDEBAR_WIDTH} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <TopBar height={TOPBAR_HEIGHT} />
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            mt: `${TOPBAR_HEIGHT}px`,
            bgcolor: "background.default",
            minHeight: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
