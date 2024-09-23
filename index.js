const fetchAssignments = async () => {
  const masterData = await fetch('/data/master.json').then((response) =>
    response.json()
  );

  const promises = masterData.files.map((f) => fetch(f));

  const responses = await Promise.all(promises);
  return await Promise.all(responses.map((r) => r.json()));
};

const isNumber = (x) => !isNaN(x);

const createRowData = (assignmentNames, [name, results]) => {
  const internName = name.split('@')[0];
  return [
    internName,
    ...assignmentNames.flatMap((assignmentName) => {
      const id = createAssignmentId(assignmentName);
      const assignmentResult = results[id];

      if (!assignmentResult) {
        return ['-', '-', '-'];
      }

      const { passing, failing, bombed } = assignmentResult;
      return [passing, failing, bombed];
    }),
  ];
};

const renderTableBody = (table, internResults, assignmentNames) => {
  const tbody = document.createElement('tbody');
  const rowEntries = Object.entries(internResults).map(
    createRowData.bind(null, assignmentNames)
  );

  rowEntries.forEach((rd) => {
    const tr = document.createElement('tr');
    rd.forEach((cellData, index) => {
      const cell = document.createElement('td');
      const isBoundary = index % 3 === 0;
      const cellClasses = [
        'px-4',
        'py-2',
        'border',
        'border-gray-400',
        'text-sm',
      ];

      if (isBoundary) {
        cellClasses.push('border-r-black');
        cellClasses.push('border-r-2');
      }

      if (isNumber(cellData) || cellData === '-') {
        cellClasses.push('text-right');
      }

      cell.classList.add(...cellClasses);
      cell.textContent = cellData;
      tr.appendChild(cell);
    });

    tbody.append(tr);
  });

  table.appendChild(tbody);
};

const createHeaderCell = (content, attrs = {}, classes = []) => {
  const headerClasses = ['px-4', 'py-2', 'border', 'border-gray-400'];
  const cell = document.createElement('th');

  cell.classList.add(...headerClasses, ...classes);
  Object.entries(attrs).forEach(([name, value]) => {
    cell.setAttribute(name, value);
  });

  cell.textContent = content;

  return cell;
};

const renderTableHead = (table, assinmentNames) => {
  const thead = document.createElement('thead');
  const superHead = document.createElement('tr');
  const subHead = document.createElement('tr');

  const nameCell = createHeaderCell('Name', { rowspan: '2' });
  superHead.appendChild(nameCell);

  assinmentNames.forEach((name) => {
    const superHeadCell = createHeaderCell(name, { colspan: 3 }, [
      'border-x-black',
      'border-x-2',
    ]);

    const subHeadCellClasses = ['text-sm', 'text-right'];
    const passingCell = createHeaderCell('P', {}, [
      ...subHeadCellClasses,
      'border-l-black',
      'border-l-2',
    ]);
    const failingCell = createHeaderCell('F', {}, subHeadCellClasses);
    const bombedCell = createHeaderCell('B', {}, [
      ...subHeadCellClasses,
      'border-r-black',
      'border-r-2',
    ]);

    superHead.appendChild(superHeadCell);

    subHead.appendChild(passingCell);
    subHead.appendChild(failingCell);
    subHead.appendChild(bombedCell);
  });

  thead.appendChild(superHead);
  thead.appendChild(subHead);
  table.appendChild(thead);
};

const createAssignmentId = (name) => {
  return name.toLowerCase().replace(' ', '_');
};

const classifyByInterns = (assignments) => {
  const classified = {};
  for (const assignment of assignments) {
    const assignmentId = createAssignmentId(assignment.name);
    for (const result of assignment.results) {
      const intern = classified[result.name] ?? {};
      intern[assignmentId] = { ...result };
      classified[result.name] = intern;
    }
  }

  return classified;
};

const showReports = async () => {
  const assignments = await fetchAssignments();
  const assignmentNames = assignments.map(({ name }) => name);
  const assignmentContainer = document.getElementById('assignment-container');

  const table = document.createElement('table');
  table.classList.add(
    'w-full',
    'table-auto',
    'border-collapse',
    'border',
    'border-gray-400'
  );

  renderTableHead(table, assignmentNames);
  renderTableBody(table, classifyByInterns(assignments), assignmentNames);

  assignmentContainer.appendChild(table);
};

window.onload = showReports;
