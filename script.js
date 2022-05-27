let allExpenses = [];
const url = 'http://localhost:9000';
const fetchHeaders = {
  'Content-type': 'application/json',
};

window.onload = async () => {
  try {
    const res = await fetch(`${url}/expenses`);
    const data = await res.json();
    allExpenses = data;
    render();
  } catch (error) {
    showErrorMessage(error);
  }
};

const addExpense = async (e) => {
  const nameInput = document.querySelector('#expense-name');
  const amountInput = document.querySelector('#expense-amount');
  const errorMessage = document.querySelector('.error-message');
  if (nameInput === null 
    || amountInput === null
    || errorMessage === null
  ) {
    return;
  }

  if ( nameInput.value.trim() === '' 
    || amountInput.value.trim() === '' 
    || Number.isNaN(+amountInput.value)
  ) {
    nameInput.classList.add('error');
    amountInput.classList.add('error');
    errorMessage.classList.remove('hidden');
    return;
  }

  try {
    const res = await fetch(`${url}/addExpense`, {
      method: 'POST',
      body: JSON.stringify({
        name: nameInput.value,
        amount: +amountInput.value,
      }),
      headers: fetchHeaders,
    });
    const data = await res.json();

    allExpenses.push(data);
    render();
  } catch (error) {
    showErrorMessage(error);
  }

  nameInput.classList.remove('error');
  amountInput.classList.remove('error');
  errorMessage.classList.add('hidden');
  nameInput.value = '';
  amountInput.value = '';
};

const deleteExpense = async (id) => {
  try {
    const res = await fetch(`${url}/deleteExpense`, {
      method: 'DELETE',
      body: JSON.stringify({ id: id }),
      headers: fetchHeaders,
    });
    const data = await res.json();

    if (data.deletedCount > 0) {
      allExpenses = allExpenses.filter((item) => item._id !== id);
    }

    render();
  } catch (error) {
    showErrorMessage(error);
  }
};

const deleteAllExpenses = async () => {
  try {
    const res = await fetch(`${url}/deleteAll`, {
      method: 'DELETE',
    });
    const data = await res.json();

    if (data.deletedCount > 0) {
      allExpenses = [];
    }

    render();
  } catch (error) {
    showErrorMessage(error);
  }
};

const showEditFields = (id) => {
  const selectedItem = allExpenses.find((item) => item._id === id);
  const content = document.querySelector(`#content-${id}`);
  const editBlock = document.querySelector(`#edit-block-${id}`);
  const nameInput = document.querySelector(`#name-input-${id}`);
  const amountInput = document.querySelector(`#amount-input-${id}`);
  const dateInput = document.querySelector(`#date-input-${id}`);
  if (selectedItem === null 
    || content === null
    || editBlock === null
    || nameInput === null
    || amountInput === null
    || dateInput === null
  ) {
    return;
  }
  
  content.classList.add('hidden');
  editBlock.classList.remove('hidden');
  nameInput.value = selectedItem.name;
  amountInput.value = selectedItem.amount;
  dateInput.value = moment(selectedItem.date).format('YYYY-MM-DD');
};

const acceptEdits = async (id) => {
  const editingItem = allExpenses.find((item) => item._id === id);
  const newName = document.querySelector(`#name-input-${id}`);
  const newAmount = document.querySelector(`#amount-input-${id}`);
  const newDate = document.querySelector(`#date-input-${id}`);
  const errorMessage = document.querySelector('.error-message');
  const content = document.querySelector(`#content-${id}`);
  const editBlock = document.querySelector(`#edit-block-${id}`);
  if (editingItem === null
    || newName === null 
    || newAmount === null 
    || newDate === null
    || errorMessage === null
    || content === null
    || editBlock === null
  ) {
    return;
  }

  if ( newName.value.trim() === '' 
    || newAmount.value.trim() === '' 
    || Number.isNaN(+newAmount.value)
  ) {
    newName.classList.add('error');
    newAmount.classList.add('error');
    errorMessage.classList.remove('hidden');
    return;
  }

  try {
    const res = await fetch(`${url}/updateExpense`, {
      method: 'PATCH',
      body: JSON.stringify({
        _id: id,
        name: newName.value,
        amount: +newAmount.value,
        date: newDate.value === ''
          ? editingItem.date
          : new Date(newDate.value).toISOString(),
      }),
      headers: fetchHeaders,
    });
    const data = await res.json();
    allExpenses = allExpenses.map(item => item._id === id ? data : item);
    
    errorMessage.classList.add('hidden');
    render();
  } catch (error) {
    showErrorMessage(error);
  }

  content.classList.remove('hidden');
  editBlock.classList.add('hidden');
};

const hideEditFields = (id) => {
  const content = document.querySelector(`#content-${id}`);
  const editBlock = document.querySelector(`#edit-block-${id}`);
  if (content === null || editBlock === null) {
    return;
  }

  content.classList.remove('hidden');
  editBlock.classList.add('hidden');
};

const showErrorMessage = (error) => {
  const fetchError = document.querySelector('.fetch-error');
  if (fetchError === null) {
    return;
  }

  fetchError.classList.remove('hidden');
  fetchError.innerText = `${error}`;
};

const render = () => {
  let sumTotalSpent = allExpenses.reduce((acc, item) => acc += item.amount, 0)
  
  const expensesList = document.querySelector('.expenses');
  const sumNum = document.querySelector('.sum-num');
  const fetchError = document.querySelector('.fetch-error');
  if (expensesList === null
    || sumNum === null
    || fetchError === null
  ) {
    return;
  }
  
  sumNum.innerText = sumTotalSpent;
  fetchError.classList.add('hidden');

  allExpenses.length > 1
    ? document.querySelector('.clear-button').classList.remove('hidden')
    : document.querySelector('.clear-button').classList.add('hidden');

  while (expensesList.firstChild) {
    expensesList.removeChild(expensesList.firstChild);
  }

  const sortedExpenses = [...allExpenses];
  sortedExpenses.sort((a, b) => {
    const dateParsedA = new Date(Date.parse(a.date));
    const dateParsedB = new Date(Date.parse(b.date));
    if (dateParsedA.toISOString() === a.date 
      && dateParsedB.toISOString() === b.date) {
        return new Date(b.date) - new Date(a.date);
      }
    return showErrorMessage('Dates is wrong format (not ISO)');
  })

  sortedExpenses.forEach((item, index) => {
    const { _id, name, amount, date } = item;
    
    // li
    const expense = document.createElement('li');
    expense.className = 'expenses__item';

    const expenseNumber = document.createElement('p');
    expenseNumber.className = 'expense-number text';
    expenseNumber.innerText = `${index + 1})`;

    // CONTENT
    const content = document.createElement('div');
    content.id = `content-${_id}`;
    content.className = 'content';

    const contentName = document.createElement('p');
    contentName.className = 'text text-name ';
    contentName.innerText = name;

    // date-amount box
    const dateAmountBlock = document.createElement('div');
    dateAmountBlock.className = 'date-amount-box';

    const dateElement = document.createElement('p');
    dateElement.className = 'text';
    dateElement.innerText = moment(date).format('DD.MM.YY');

    const amountElement = document.createElement('p');
    amountElement.className = 'text';
    amountElement.innerText = `${amount} р.`;

    // date-amount box appending
    dateAmountBlock.appendChild(dateElement);
    dateAmountBlock.appendChild(amountElement);

    // buttons box
    const buttonsBlock = document.createElement('div');
    buttonsBlock.className = 'buttons';

    const editButton = document.createElement('button');
    editButton.className = 'button expense-button';
    editButton.onclick = () => {
      showEditFields(_id);
    };
    const editButtonImg = document.createElement('img');
    editButtonImg.src = 'img/edit_icon.png';
    editButtonImg.alt = 'pencil';
    editButtonImg.className = 'icon';

    const deleteButton = document.createElement('button');
    deleteButton.className = 'button expense-button';
    deleteButton.onclick = () => {
      deleteExpense(_id);
    };
    const deleteButtonImg = document.createElement('img');
    deleteButtonImg.src = 'img/delete_icon.png';
    deleteButtonImg.alt = 'trash can';
    deleteButtonImg.className = 'icon';

    // Buttons appending
    editButton.appendChild(editButtonImg);
    deleteButton.appendChild(deleteButtonImg);
    buttonsBlock.appendChild(editButton);
    buttonsBlock.appendChild(deleteButton);

    // EDIT FIELDS
    const editBlock = document.createElement('div');
    editBlock.id = `edit-block-${_id}`;
    editBlock.className = 'edit-block hidden';

    const nameInput = document.createElement('input');
    nameInput.id = `name-input-${_id}`;
    nameInput.type = 'text';
    nameInput.className = 'edit-input name-input';

    // date-amount box
    const dateAmountEditBlock = document.createElement('div');
    dateAmountEditBlock.className = 'date-amount-box';

    const dateInput = document.createElement('input');
    dateInput.id = `date-input-${_id}`;
    dateInput.type = 'date';
    dateInput.className = 'edit-input';

    const amountInput = document.createElement('input');
    amountInput.id = `amount-input-${_id}`;
    amountInput.type = 'text';
    amountInput.className = 'edit-input';

    dateAmountEditBlock.appendChild(dateInput);
    dateAmountEditBlock.appendChild(amountInput);

    // edit buttons
    const buttonsEditBlock = document.createElement('div');
    buttonsEditBlock.className = 'buttons';

    const doneButton = document.createElement('button');
    doneButton.className = 'button expense-button';
    doneButton.onclick = () => {
      acceptEdits(_id);
    };
    const doneButtonImg = document.createElement('img');
    doneButtonImg.src = 'img/done_icon.png';
    doneButtonImg.alt = 'checkmark';
    doneButtonImg.className = 'icon ';

    const cancelButton = document.createElement('button');
    cancelButton.className = 'button expense-button';
    cancelButton.onclick = () => {
      hideEditFields(_id);
    };
    const cancelButtonImg = document.createElement('img');
    cancelButtonImg.src = 'img/close_icon.png';
    cancelButtonImg.alt = 'cross';
    cancelButtonImg.className = 'icon';

    doneButton.appendChild(doneButtonImg);
    cancelButton.appendChild(cancelButtonImg);
    buttonsEditBlock.appendChild(doneButton);
    buttonsEditBlock.appendChild(cancelButton);

    // final appending
    content.appendChild(contentName);
    content.appendChild(dateAmountBlock);
    content.appendChild(buttonsBlock);

    editBlock.appendChild(nameInput);
    editBlock.appendChild(dateAmountEditBlock);
    editBlock.appendChild(buttonsEditBlock);

    expense.appendChild(expenseNumber);
    expense.appendChild(content);
    expense.appendChild(editBlock);
    expensesList.appendChild(expense);
  });
};
