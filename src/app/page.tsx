'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, TableSortLabel, TablePagination,
  Button, Box, Modal, Checkbox, FormControlLabel, IconButton,
  createTheme, ThemeProvider, CssBaseline
} from '@mui/material';
import { FileUpload, FileDownload, Add, Delete, Save, Edit } from '@mui/icons-material';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

// Type definitions
type Row = { id: string; name: string; email: string; age: number; role: string; [key: string]: any };

// Default data
const defaultRows: Row[] = [
  { id: '1', name: 'Aarav Sharma', email: 'aarav.sharma@mail.com', age: 25, role: 'Admin' },
  { id: '2', name: 'Priya Patel', email: 'priya.patel@mail.com', age: 28, role: 'Manager' },
  { id: '3', name: 'Rohan Mehta', email: 'rohan.mehta@mail.com', age: 30, role: 'User' },
  { id: '4', name: 'Ananya Gupta', email: 'ananya.gupta@mail.com', age: 26, role: 'User' },
  { id: '5', name: 'Vikram Nair', email: 'vikram.nair@mail.com', age: 35, role: 'Admin' },
  { id: '6', name: 'Neha Reddy', email: 'neha.reddy@mail.com', age: 29, role: 'Manager' },
  { id: '7', name: 'Karan Verma', email: 'karan.verma@mail.com', age: 32, role: 'User' },
  { id: '8', name: 'Isha Singh', email: 'isha.singh@mail.com', age: 24, role: 'User' },
  { id: '9', name: 'Rahul Das', email: 'rahul.das@mail.com', age: 27, role: 'Admin' },
  { id: '10', name: 'Sneha Iyer', email: 'sneha.iyer@mail.com', age: 31, role: 'Manager' },
  { id: '11', name: 'Arjun Joshi', email: 'arjun.joshi@mail.com', age: 33, role: 'User' },
  { id: '12', name: 'Meera Pillai', email: 'meera.pillai@mail.com', age: 29, role: 'User' },
  { id: '13', name: 'Dev Khanna', email: 'dev.khanna@mail.com', age: 34, role: 'Admin' },
  { id: '14', name: 'Riya Chatterjee', email: 'riya.chatterjee@mail.com', age: 23, role: 'User' },
  { id: '15', name: 'Amit Malhotra', email: 'amit.malhotra@mail.com', age: 36, role: 'Manager' },
];


// Default columns
const defaultColumns = [
  { key: 'name', label: 'Name', visible: true },
  { key: 'email', label: 'Email', visible: true },
  { key: 'age', label: 'Age', visible: true },
  { key: 'role', label: 'Role', visible: true },
];

export default function DataTableManager() {
  const [rows, setRows] = useState<Row[]>(defaultRows);
  const [columns, setColumns] = useState(defaultColumns);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [open, setOpen] = useState(false);
  const [newColumn, setNewColumn] = useState('');
  const [editing, setEditing] = useState(false);
  const [editedRows, setEditedRows] = useState<Row[]>([]);

  const rowsPerPage = 10;

  // Load columns from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('columns');
    if (saved) setColumns(JSON.parse(saved));
  }, []);

  // Save columns visibility
  useEffect(() => {
    localStorage.setItem('columns', JSON.stringify(columns));
  }, [columns]);

  // Filter + Sort data
  const filteredData = useMemo(() => {
    let result = rows.filter(r =>
      columns
        .filter(c => c.visible)
        .some(c => String(r[c.key] ?? '').toLowerCase().includes(search.toLowerCase()))
    );
    return result.sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (av < bv) return sortDirection === 'asc' ? -1 : 1;
      if (av > bv) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rows, columns, search, sortField, sortDirection]);

  const paginated = filteredData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  // Sorting
  const handleSort = (field: string) => {
    const asc = sortField === field && sortDirection === 'asc';
    setSortField(field);
    setSortDirection(asc ? 'desc' : 'asc');
  };

  // Manage Columns
  const toggleColumn = (key: string) => {
    setColumns(cols => cols.map(c => c.key === key ? { ...c, visible: !c.visible } : c));
  };
  const addColumn = () => {
    if (!newColumn.trim()) return;
    const key = newColumn.toLowerCase();
    setColumns([...columns, { key, label: newColumn, visible: true }]);
    setRows(rows.map(r => ({ ...r, [key]: '' })));
    setNewColumn('');
  };

  // Import CSV
  const importCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const newRows = res.data.map((r: any, i: number) => ({ id: String(i + 1), ...r }));
        setRows(newRows);
      },
      error: (err) => alert('CSV Import error: ' + err.message),
    });
  };

  // Export CSV
  const exportCSV = () => {
    const visibleCols = columns.filter(c => c.visible).map(c => c.key);
    const csv = Papa.unparse(rows.map(r => {
      const d: any = {};
      visibleCols.forEach(k => d[k] = r[k]);
      return d;
    }));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'data-table.csv');
  };

  // Delete Row
  const deleteRow = (id: string) => {
    if (confirm('Delete this row?')) setRows(rows.filter(r => r.id !== id));
  };

  // Inline Edit
  const startEditing = () => {
    setEditedRows([...rows]);
    setEditing(true);
  };
  const handleEdit = (id: string, key: string, value: string) => {
    setEditedRows(editedRows.map(r => r.id === id ? { ...r, [key]: value } : r));
  };
  const saveAll = () => {
    setRows(editedRows);
    setEditing(false);
  };

  // Theme
  const theme = createTheme({ palette: { mode: themeMode } });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <h2>Dynamic Data Table Manager</h2>
          <Button onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}>
            Toggle {themeMode === 'light' ? '🌙 Dark' : '☀️ Light'}
          </Button>
        </Box>

        <Box display="flex" gap={1} mb={2}>
          <Button variant="contained" component="label" startIcon={<FileUpload />}>
            Import CSV
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={(e) => e.target.files && importCSV(e.target.files[0])}
            />
          </Button>
          <Button variant="contained" color="success" startIcon={<FileDownload />} onClick={exportCSV}>
            Export CSV
          </Button>
          <Button variant="outlined" onClick={() => setOpen(true)}>Manage Columns</Button>
          {editing ? (
            <>
              <Button variant="contained" color="primary" startIcon={<Save />} onClick={saveAll}>
                Save All
              </Button>
              <Button onClick={() => setEditing(false)}>Cancel</Button>
            </>
          ) : (
            <Button variant="outlined" startIcon={<Edit />} onClick={startEditing}>Edit Rows</Button>
          )}
        </Box>

        <TextField
          fullWidth
          label="Search..."
          sx={{ mb: 2 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {columns.filter(c => c.visible).map(c => (
                  <TableCell key={c.key}>
                    <TableSortLabel
                      active={sortField === c.key}
                      direction={sortField === c.key ? sortDirection : 'asc'}
                      onClick={() => handleSort(c.key)}
                    >
                      {c.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {(editing ? editedRows : paginated).map((r) => (
                <TableRow key={r.id}>
                  {columns.filter(c => c.visible).map(c => (
                    <TableCell key={c.key}>
                      {editing ? (
                        <TextField
                          size="small"
                          value={r[c.key] ?? ''}
                          onChange={(e) => handleEdit(r.id, c.key, e.target.value)}
                        />
                      ) : (
                        r[c.key]
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <IconButton color="error" onClick={() => deleteRow(r.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10]}
        />

        {/* Manage Columns Modal */}
        <Modal open={open} onClose={() => setOpen(false)}>
          <Box sx={{
            backgroundColor: 'background.paper',
            p: 3,
            borderRadius: 2,
            width: 400,
            mx: 'auto',
            mt: 10
          }}>
            <h3>Manage Columns</h3>
            {columns.map(c => (
              <FormControlLabel
                key={c.key}
                control={<Checkbox checked={c.visible} onChange={() => toggleColumn(c.key)} />}
                label={c.label}
              />
            ))}
            <Box display="flex" gap={1} mt={2}>
              <TextField
                label="New Column"
                value={newColumn}
                onChange={(e) => setNewColumn(e.target.value)}
                fullWidth
              />
              <IconButton color="primary" onClick={addColumn}>
                <Add />
              </IconButton>
            </Box>
            <Box textAlign="right" mt={2}>
              <Button onClick={() => setOpen(false)}>Close</Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    </ThemeProvider>
  );
}
