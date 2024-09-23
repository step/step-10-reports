const fetchAssignments = async () => {
  const masterData = await fetch('/data/master.json').then((response) =>
    response.json()
  );

  const promises = masterData.files.map((f) => fetch(f));

  const responses = await Promise.all(promises);
  return await Promise.all(responses.map((r) => r.json()));
};

const createRow = (result) => {
  const tr = document.createElement('tr');
  const td1 = document.createElement('td');
  td1.classList.add('px-4', 'py-2', 'border', 'border-gray-400');
  td1.textContent = result.name.split('@')[0];
  tr.appendChild(td1);

  const td2 = document.createElement('td');
  td2.classList.add('px-4', 'py-2', 'border', 'border-gray-400');
  td2.textContent = result.passing;
  tr.appendChild(td2);

  const td3 = document.createElement('td');
  td3.classList.add('px-4', 'py-2', 'border', 'border-gray-400');
  td3.textContent = result.failing;
  tr.appendChild(td3);

  const td4 = document.createElement('td');
  td4.classList.add('px-4', 'py-2', 'border', 'border-gray-400');
  td4.textContent = result.bombed;
  tr.appendChild(td4);

  return tr;
};

const renderTableBody = (table, results) => {
  const tbody = document.createElement('tbody');
  results.map(createRow).forEach((tr) => tbody.appendChild(tr));
  table.appendChild(tbody);
};

const renderTableHead = (table) => {
  const thead = document.createElement('thead');
  const tr = document.createElement('tr');
  const th1 = document.createElement('th');
  th1.classList.add('px-4', 'py-2', 'border', 'border-gray-400');
  th1.textContent = 'Name';
  tr.appendChild(th1);

  const th2 = document.createElement('th');
  th2.classList.add('px-4', 'py-2', 'border', 'border-gray-400');
  th2.textContent = 'Passing';
  tr.appendChild(th2);

  const th3 = document.createElement('th');
  th3.classList.add('px-4', 'py-2', 'border', 'border-gray-400');
  th3.textContent = 'Failing';
  tr.appendChild(th3);

  const th4 = document.createElement('th');
  th4.classList.add('px-4', 'py-2', 'border', 'border-gray-400');
  th4.textContent = 'Bombed';
  tr.appendChild(th4);

  thead.appendChild(tr);
  table.appendChild(thead);
};

const renderSection = (assignmentContainer, assignmentData) => {
  const section = document.createElement('section');
  section.classList.add('mb-8');
  section.setAttribute('id', createAssignmentId(assignmentData.assignment));

  const h2 = document.createElement('h2');
  h2.classList.add('text-2xl', 'font-bold', 'mb-4');
  h2.textContent = assignmentData.assignment;

  section.appendChild(h2);

  const table = document.createElement('table');
  table.classList.add(
    'w-full',
    'table-auto',
    'border-collapse',
    'border',
    'border-gray-400'
  );

  renderTableHead(table);
  renderTableBody(table, assignmentData.results);

  section.appendChild(table);
  assignmentContainer.appendChild(section);
};

const createAssignmentId = (name) => {
  return name.toLowerCase().replace(' ', '_');
};

const renderQuickLinks = (assignments) => {
  const container = document.getElementById('q-links');
  const listItems = assignments.map(({ assignment }) => {
    const item = document.createElement('li');
    item.classList.add('cursor-pointer', 'hover:text-slate-400');

    const link = document.createElement('a');
    const id = createAssignmentId(assignment);

    link.setAttribute('href', `#${id}`);
    link.textContent = assignment;

    item.appendChild(link);
    return item;
  });

  listItems.forEach((item) => container.appendChild(item));

  return;
};

const showReports = async () => {
  const assignments = await fetchAssignments();
  const assignmentContainer = document.getElementById('assignment-container');

  assignments.forEach(renderSection.bind(null, assignmentContainer));

  renderQuickLinks(assignments);
};

window.onload = showReports;
