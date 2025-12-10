/* eslint-disable */
// Full enhanced WorkHoursTable component
import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Center,
  Flex,
  Tooltip,
  Heading,
  Button,
  Badge,
  Spinner,
  Input,
  useColorModeValue,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import { getMachineReports } from "../../utils/axiosInstance"; // Backend API

export default function WorkHoursTable() {
  const customColor = "#FF6B6B";
  const [workData, setWorkData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [filterDate, setFilterDate] = useState("");
  const [search, setSearch] = useState("");

  // tick now every 10s to animate running timelines
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(t);
  }, []);

  // safe CSS injection for animations & small helpers
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.setAttribute("data-from", "work-hours-timeline");
    styleTag.innerHTML = `
      @keyframes progressPulse {
        0% { box-shadow: 0 0 0 0 rgba(0,0,0,0.12); transform: translateY(0); }
        50% { box-shadow: 0 6px 18px -6px rgba(0,0,0,0.18); transform: translateY(-1px); }
        100% { box-shadow: 0 0 0 0 rgba(0,0,0,0.12); transform: translateY(0); }
      }
      .timeline-seg-text {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    `;
    document.head.appendChild(styleTag);
    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  // fetch reports
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getMachineReports();
        const machineData =
          (res?.data?.data || []).map((item) => ({
            machine: item.machineNo || "-",
            receiverNo: item.receiverNo || "-",
            user: item.operatorName || "-",
            material: `${item.fabric || "-"} - ${item.color || "-"}`,
            customer: item.companyName || "-",
            start: item.startTimeFormatted || "-",
            end: item.endTimeFormatted || "-",
            date: item.date || "-",
            total: item.runningTime ? `${item.runningTime} min` : "-",
            cost: item.weight || 0,
            status: item.status || "-",
            raw: item,
          })) || [];
        setWorkData(machineData);
      } catch (error) {
        console.error("Error Loading Machine Report", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // search / filter
  const filteredData = workData.filter((row) => {
    const s = search.toLowerCase();

    const matchesSearch =
      row.user?.toLowerCase().includes(s) ||
      row.customer?.toLowerCase().includes(s) ||
      row.material?.toLowerCase().includes(s) ||
      row.status?.toLowerCase().includes(s);

    const matchesDate = !filterDate || row.date === filterDate; // ★ only show selected date

    return matchesSearch && matchesDate;
  });

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // time parsing
  const parseTime = (time) => {
    if (!time || typeof time !== "string") return NaN;
    if (time.trim() === "-") return NaN;
    // if format "HH:MM AM/PM"
    if (time.includes(" ")) {
      const [hourMin, period] = time.split(" ");
      let [h, m] = hourMin.split(":").map(Number);
      if (period === "PM" && h !== 12) h += 12;
      if (period === "AM" && h === 12) h = 0;
      return h + (m || 0) / 60;
    }
    // assume 24h "HH:MM"
    const [hRaw, mRaw] = time.split(":");
    const h = Number(hRaw);
    const m = Number(mRaw || 0);
    return Number.isFinite(h) ? h + (m || 0) / 60 : NaN;
  };

  // shift definitions
  const shifts = [
    { name: "Night", start: 0, end: 6, color: "#6b7280" }, // midnight - 6
    { name: "Morning", start: 6, end: 12, color: "#5bc0f8" }, // 6 - 12
    { name: "Afternoon", start: 12, end: 18, color: "#ffcb42" }, // 12 - 18
    { name: "Evening", start: 18, end: 24, color: "#ff914d" }, // 18 - 24
  ];

  // create multi-segments across shifts
  const getTimelineSegments = (start, end, status) => {
    if (!start || start === "-" || !start.includes(":")) return [];
    let startHour = parseTime(start);
    let endHour = parseTime(end);

    // if running or missing end use now
    if (!Number.isFinite(endHour) || status === "Running") {
      const nowDate = now || new Date();
      endHour = nowDate.getHours() + nowDate.getMinutes() / 60;
    }
    if (!Number.isFinite(startHour)) return [];

    // normalize across day
    if (endHour <= startHour) endHour += 24;

    // collect segments by checking each shift window (allow shifts to be extended to 24..30 for overlaps)
    const segs = [];
    // use shifts repeated for next day by mapping each shift to both day0 and day1
    const expandedShifts = shifts.concat(
      shifts.map((s) => ({ ...s, start: s.start + 24, end: s.end + 24 }))
    );

    for (const shift of expandedShifts) {
      const overlapStart = Math.max(startHour, shift.start);
      const overlapEnd = Math.min(endHour, shift.end);
      if (overlapEnd > overlapStart) {
        const durationHours = overlapEnd - overlapStart;
        // scaling: 1 hour = 12px (tweakable)
        const width = Math.max(2, Math.round(durationHours * 12));
        segs.push({
          name: shift.name,
          width,
          color: shift.color,
          startTime: overlapStart % 24,
          endTime: overlapEnd % 24,
          isRunning: status === "Running",
          durationHours,
        });
      }
    }

    return segs;
  };

  // status color fallback (used for label background if needed)
  const getStatusColor = (status) => {
    switch (status) {
      case "Running":
        return "green.400";
      case "Paused":
        return "yellow.300";
      case "Freezed":
        return "purple.400";
      case "Completed":
        return "gray.400";
      case "Pending":
        return "red.300";
      default:
        return "gray.300";
    }
  };

  const tableBg = useColorModeValue(
    "rgba(255,255,255,0.95)",
    "rgba(18,18,18,0.85)"
  );

  // time scale tick labels (for header scale)
  const scaleTicks = ["00:00", "06:00", "12:00", "18:00", "00:00"];

  return (
    <Flex flexDirection="column" pt="40px" px={{ base: 2, md: 6 }}>
      <Card p={4} shadow="xl" bg="white">
        <CardHeader bg="white" p={0} mb={3}>
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
            <Heading size="sm" color="gray.700">
              🏭 Machine Work Reports
            </Heading>

            <Flex
              align="center"
              flex="1"
              maxW="480px"
              gap={2} // ⭐ maintains proper spacing
            >
              {/* Search Input */}
              <Input
                placeholder="Search by operator, customer, material or status..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                size="sm"
                borderColor={`${customColor}50`}
                _hover={{ borderColor: customColor }}
                _focus={{
                  borderColor: customColor,
                  boxShadow: `0 0 0 1px ${customColor}`,
                }}
                color="black"
              />

              {/* Search Icon */}
              <SearchIcon color="gray.500" />

              {/* Clear Button */}
              {search && (
                <Button
                  size="sm"
                  onClick={() => setSearch("")}
                  bg="white"
                  color={customColor}
                  border="1px"
                  borderColor={customColor}
                  _hover={{ bg: customColor, color: "white" }}
                >
                  Clear
                </Button>
              )}

              {/* Date Filter */}
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value);
                  setCurrentPage(1);
                }}
                size="sm"
                color="black"
                borderColor={`${customColor}50`}
                _hover={{ borderColor: customColor }}
                _focus={{
                  borderColor: customColor,
                  boxShadow: `0 0 0 1px ${customColor}`,
                }}
              />
            </Flex>
          </Flex>
        </CardHeader>

        {/* Time scale row */}
        {/* <Box mb={2} px={2}>
          <Flex align="center" justify="space-between" maxW="1000px" mx="auto">
            {scaleTicks.map((t) => (
              <Text key={t} fontSize="xs" color="gray.500">
                {t}
              </Text>
            ))}
          </Flex>
        </Box> */}

        <CardBody bg={tableBg}>
          <Box overflowX="auto" w="100%">
            <Table variant="simple" bg="white" size="sm" minW="900px">
              <Thead bg={`${customColor}20`}>
                <Tr>
                  {[
                    "Machine No",
                    "Receiver",
                    "Operator",
                    "Company",
                    "Fabric",
                    "Start",
                    "End",
                    "Date",
                    "Running Time",
                    "Weight",
                    "Status",
                    "Timeline",
                  ].map((h, i) => (
                    <Th key={i} textAlign="center" color="gray.700">
                      {h}
                    </Th>
                  ))}
                </Tr>
              </Thead>

              <Tbody>
                {/* loading row kept inside tbody so columns keep alignment */}
                {loading ? (
                  <Tr>
                    <Td colSpan={12} textAlign="center" py={6}>
                      <Flex justify="center" align="center" gap={3}>
                        <Spinner size="lg" color={customColor} />
                        <Text fontWeight="bold" color={customColor}>
                          Loading machine reports...
                        </Text>
                      </Flex>
                    </Td>
                  </Tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map((row, idx) => {
                    const segs = getTimelineSegments(
                      row.start,
                      row.end,
                      row.status
                    );

                    return (
                      <Tr key={idx} _hover={{ bg: `${customColor}10` }}>
                        <Td textAlign="center">{row.machine}</Td>
                        <Td textAlign="center">{row.receiverNo}</Td>
                        <Td textAlign="center">{row.user}</Td>
                        <Td textAlign="center">{row.customer}</Td>
                        <Td textAlign="center">{row.material}</Td>
                        <Td textAlign="center">{row.start}</Td>
                        <Td textAlign="center">{row.end}</Td>
                        <Td textAlign="center">{row.date}</Td>
                        <Td textAlign="center">{row.total}</Td>
                        <Td textAlign="center">₹{row.cost}</Td>
                        <Td textAlign="center">
                          <Badge
                            colorScheme={
                              String(getStatusColor(row.status)).includes(
                                "green"
                              )
                                ? "green"
                                : "gray"
                            }
                          >
                            {row.status}
                          </Badge>
                        </Td>

                        {/* Timeline cell */}
                        <Td>
                          {segs.length === 0 ? (
                            <Text fontSize="xs" color="gray.500">
                              -
                            </Text>
                          ) : (
                            <Flex
                              h="22px"
                              align="center"
                              bg="gray.100"
                              borderRadius="6px"
                              overflow="hidden"
                              px={1}
                              gap={1}
                            >
                              {segs.map((seg, i) => {
                                // label inside segment: "<Shift> - <Status>" (A3)
                                const label = `${seg.name} — ${row.status}`;
                                const showLabel = seg.width > 70; // only show when enough width
                                const segBg =
                                  row.status === "Running" && seg.isRunning
                                    ? "linear-gradient(90deg, rgba(34,197,94,0.95), rgba(16,185,129,0.9))"
                                    : seg.color;

                                return (
                                  <Tooltip
                                    key={i}
                                    label={
                                      <>
                                        <Text fontWeight="bold">
                                          {row.machine} • {seg.name}
                                        </Text>
                                        <Text>Status: {row.status}</Text>
                                        <Text>
                                          {`From: ${seg.startTime
                                            .toFixed(2)
                                            .replace(
                                              ".",
                                              ":"
                                            )}  To: ${seg.endTime
                                            .toFixed(2)
                                            .replace(".", ":")}`}
                                        </Text>
                                      </>
                                    }
                                    hasArrow
                                  >
                                    <Flex
                                      align="center"
                                      justify={
                                        showLabel ? "center" : "flex-start"
                                      }
                                      key={i}
                                      px={showLabel ? 1 : 0.5}
                                      style={{
                                        width: `${seg.width}px`,
                                        minWidth: "2px",
                                        height: "16px",
                                        borderRadius: "4px",
                                        background:
                                          typeof segBg === "string"
                                            ? segBg
                                            : seg.color,
                                        position: "relative",
                                        overflow: "hidden",
                                        ...(seg.isRunning
                                          ? {
                                              animation:
                                                "progressPulse 1.6s ease-in-out infinite",
                                              boxShadow:
                                                "0 6px 18px -6px rgba(0,0,0,0.18)",
                                            }
                                          : {}),
                                      }}
                                    >
                                      {/* label inside segment (hide if too narrow) */}
                                      {showLabel && (
                                        <Text
                                          className="timeline-seg-text"
                                          fontSize="xs"
                                          fontWeight="600"
                                          color="white"
                                        >
                                          {label}
                                        </Text>
                                      )}
                                    </Flex>
                                  </Tooltip>
                                );
                              })}
                            </Flex>
                          )}
                        </Td>
                      </Tr>
                    );
                  })
                ) : (
                  <Tr>
                    <Td colSpan={12} textAlign="center" py={6}>
                      No records found
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>

          {/* Pagination */}
          <Flex justify="center" mt={4} gap={2}>
            <Button
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              bg="white"
              border="1px"
              borderColor={customColor}
              color={customColor}
            >
              ⬅ Prev
            </Button>

            <Text fontWeight="bold">
              {currentPage} / {totalPages}
            </Text>

            <Button
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              bg="white"
              border="1px"
              borderColor={customColor}
              color={customColor}
            >
              Next ➡
            </Button>
          </Flex>
        </CardBody>
      </Card>
    </Flex>
  );
}
