import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TablePagination, Tooltip, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CallIcon from '@mui/icons-material/Call';
import SmsIcon from '@mui/icons-material/Sms';
import EmailIcon from '@mui/icons-material/Email';
import axios from 'axios';
import API_BASE_URL from '../config';

function Dashboard() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('1day'); // Default filter is 1 day

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userId = localStorage.getItem('user_id');
        const response = await axios.get(`${API_BASE_URL}/dashboard/${userId}`, {
          params: {
            filter,
          },
        });
        setData(response.data.calls || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const filteredData = data.filter((item) => {
    const fromNumber = item.from || '';
    const toNumber = item.to || '';
    const summary = item.summary || '';
    return fromNumber.includes(searchTerm) || toNumber.includes(searchTerm) || summary.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <Container>
      <Box sx={{ mt: 10, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 4 }}>Dashboard</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'left', alignItems: 'left', mb: 3, gap: 2, backgroundColor: 'white', padding: 2, borderRadius: 1 }}>
        <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Filter</InputLabel>
            <Select value={filter} onChange={handleFilterChange}>
              <MenuItem value="1day">Last 1 Day</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ width: '100%', maxWidth: '800px', height: '56px', backgroundColor: 'white', ml: 25}} // Adjust the width and height here
            InputProps={{
              endAdornment: (
                <SearchIcon />
              ),
            }}
          />

          
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date and Time</TableCell>
                  <TableCell>Call From</TableCell>
                  <TableCell>Call To</TableCell>
                  <TableCell>Summary of Call</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No calls data available
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                    <TableRow key={row.call_id}>
                      <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
                      <TableCell>{row.from}</TableCell>
                      <TableCell>{row.to}</TableCell>
                      <TableCell>{row.summary}</TableCell>
                      <TableCell>
                        <Tooltip title="Coming soon">
                          <span>
                            <IconButton aria-label="call back" disabled>
                              <CallIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Coming soon">
                          <span>
                            <IconButton aria-label="sms" disabled>
                              <SmsIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Coming soon">
                          <span>
                            <IconButton aria-label="email" disabled>
                              <EmailIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={filteredData.length}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </TableContainer>
        )}
      </Box>
    </Container>
  );
}

export default Dashboard;
