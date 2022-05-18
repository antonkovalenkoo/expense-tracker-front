const url = 'http://localhost:8000';
const fetchHeaders = {
  'Content-type': 'application/json',
};
let allExpenses = [];
let totalSpent = JSON.parse(localStorage.getItem('total')) || 0;

window.onload = async () => {
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (res.status === 404) {
      throw new Error(data.error);
    } else {
      allExpenses = data;
      render();
    }
  } catch (error) {
    showFetchError(error);
  }
};

const addExpense = async (e) => {
  e.preventDefault();

  const nameInput = document.querySelector('#expense-name');
  const amountInput = document.querySelector('#expense-amount');

  nameInput.addEventListener('keydown', removeErrorMessage);
  amountInput.addEventListener('keydown', removeErrorMessage);

  if (
    nameInput.value.trim() === '' ||
    amountInput.value.trim() === '' ||
    isNaN(amountInput.value)
  ) {
    nameInput.classList.add('error');
    amountInput.classList.add('error');
    document.querySelector('.error-message').classList.remove('hidden');
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

    if (res.status === 404) {
      throw new Error(data.error);
    } else {
      allExpenses.unshift(data);
      totalSpent += +amountInput.value;
      setToLocalStorage(totalSpent);
      render();
    }
  } catch (error) {
    showFetchError(error);
  }

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

    if (res.status === 404) {
      throw new Error(data.error);
    } else {
      const deletedItem = allExpenses.find((item) => item._id === id);
      allExpenses = allExpenses.filter((item) => item._id !== id);
      totalSpent -= deletedItem.amount;
      setToLocalStorage(totalSpent);
      render();
    }
  } catch (error) {
    showFetchError(error);
  }
};

const deleteAllExpenses = async () => {
  try {
    const res = await fetch(`${url}/deleteAll`, {
      method: 'DELETE',
    });
    const data = await res.json();

    if (res.status === 404) {
      throw new Error(data.error);
    } else {
      allExpenses = [];
      totalSpent = 0;
      setToLocalStorage(totalSpent);
      render();
    }
  } catch (error) {
    showFetchError(error);
  }
};

const showEditFields = (id) => {
  const selectedItem = allExpenses.find((item) => item._id === id);
  document.querySelector(`#content-${id}`).classList.add('hidden');
  document.querySelector(`#edit-block-${id}`).classList.remove('hidden');

  document.querySelector(`#name-input-${id}`).value = selectedItem.name;
  document.querySelector(`#amount-input-${id}`).value = selectedItem.amount;
  document.querySelector(`#date-input-${id}`).value = selectedItem.date;
};

const acceptEdits = async (id) => {
  const editingItem = allExpenses.find((item) => item._id === id);
  const oldAmount = editingItem.amount;

  const newName = document.querySelector(`#name-input-${id}`);
  const newAmount = document.querySelector(`#amount-input-${id}`);
  const newDate = document.querySelector(`#date-input-${id}`);

  const dateFormatter = () =>
    newDate.value === ''
      ? editingItem.date
      : new Date(newDate.value).toISOString();

  try {
    const res = await fetch(`${url}/updateExpense`, {
      method: 'PATCH',
      body: JSON.stringify({
        _id: id,
        name: newName.value,
        amount: +newAmount.value,
        date: dateFormatter(),
      }),
      headers: fetchHeaders,
    });
    const data = await res.json();

    if (res.status === 404) {
      throw new Error(data.error);
    } else {
      allExpenses.forEach((item) => {
        if (item._id === id) {
          item.name = newName.value;
          item.amount = newAmount.value;
          item.date = dateFormatter();
        }
      });
      totalSpent -= +oldAmount;
      totalSpent += +newAmount.value;
      setToLocalStorage(totalSpent);
      render();
    }
  } catch (error) {
    showFetchError(error);
  }

  document.querySelector(`#content-${id}`).classList.remove('hidden');
  document.querySelector(`#edit-block-${id}`).classList.add('hidden');
};

const hideEditFields = (id) => {
  document.querySelector(`#content-${id}`).classList.remove('hidden');
  document.querySelector(`#edit-block-${id}`).classList.add('hidden');
};

const removeErrorMessage = () => {
  document.querySelector('#expense-name').classList.remove('error');
  document.querySelector('#expense-amount').classList.remove('error');
  document.querySelector('.error-message').classList.add('hidden');
};

const showFetchError = (error) => {
  const fetchError = document.querySelector('.fetch-error');
  fetchError.classList.remove('hidden');
  fetchError.innerText = `${error}`;
};

const setToLocalStorage = (totalNum) =>
  localStorage.setItem('total', JSON.stringify(totalNum));

const render = () => {
  document.querySelector('.sum-num').innerText = totalSpent;
  document.querySelector('.fetch-error').classList.add('hidden');

  allExpenses.length > 1
    ? document.querySelector('.clear-btn').classList.remove('hidden')
    : document.querySelector('.clear-btn').classList.add('hidden');

  const expensesList = document.querySelector('.expenses');

  while (expensesList.firstChild) {
    expensesList.removeChild(expensesList.firstChild);
  }

  allExpenses.forEach((item, index) => {
    const { _id, name, amount, date } = item;

    // li
    const expense = document.createElement('li');
    expense.id = `expense-item-${_id}`;
    expense.className = 'expenses__item';

    const expenseNumber = document.createElement('p');
    expenseNumber.className = 'expense-number text';
    expenseNumber.innerText = `${index + 1})`;

    // CONTENT
    const content = document.createElement('div');
    content.id = `content-${_id}`;
    content.className = 'content';

    const contentName = document.createElement('p');
    contentName.id = `text-name-${_id}`;
    contentName.className = 'text text-name ';
    contentName.innerText = name;

    // date-amount box
    const dateAmountBlock = document.createElement('div');
    dateAmountBlock.className = 'date-amount-box';

    const dateElement = document.createElement('p');
    dateElement.id = `text-date-${_id}`;
    dateElement.className = 'text';
    dateElement.innerText = moment(date).format('DD.MM.YY');

    const amountElement = document.createElement('p');
    amountElement.id = `text-amount-${_id}`;
    amountElement.className = 'text';
    amountElement.innerText = `${amount} р.`;

    // date-amount box appending
    dateAmountBlock.appendChild(dateElement);
    dateAmountBlock.appendChild(amountElement);

    // btns box
    const btnsBlock = document.createElement('div');
    btnsBlock.className = 'btns';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn expense-btn';
    editBtn.onclick = () => {
      showEditFields(_id);
    };
    const editBtnImg = document.createElement('img');
    editBtnImg.src = 'img/edit_icon.png';
    editBtnImg.alt = 'pencil';
    editBtnImg.className = 'icon';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn expense-btn';
    deleteBtn.onclick = () => {
      deleteExpense(_id);
    };
    const deleteBtnImg = document.createElement('img');
    deleteBtnImg.src = 'img/delete_icon.png';
    deleteBtnImg.alt = 'trash can';
    deleteBtnImg.className = 'icon';

    // btns appending
    editBtn.appendChild(editBtnImg);
    deleteBtn.appendChild(deleteBtnImg);
    btnsBlock.appendChild(editBtn);
    btnsBlock.appendChild(deleteBtn);

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

    // edit btns
    const btnsEditBlock = document.createElement('div');
    btnsEditBlock.className = 'btns';

    const doneBtn = document.createElement('button');
    doneBtn.className = 'btn expense-btn';
    doneBtn.onclick = () => {
      acceptEdits(_id);
    };
    const doneBtnImg = document.createElement('img');
    doneBtnImg.src = 'img/done_icon.png';
    doneBtnImg.alt = 'checkmark';
    doneBtnImg.className = 'icon ';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn expense-btn';
    cancelBtn.onclick = () => {
      hideEditFields(_id);
    };
    const cancelBtnImg = document.createElement('img');
    cancelBtnImg.src = 'img/close_icon.png';
    cancelBtnImg.alt = 'cross';
    cancelBtnImg.className = 'icon';

    doneBtn.appendChild(doneBtnImg);
    cancelBtn.appendChild(cancelBtnImg);
    btnsEditBlock.appendChild(doneBtn);
    btnsEditBlock.appendChild(cancelBtn);

    // final appending
    content.appendChild(contentName);
    content.appendChild(dateAmountBlock);
    content.appendChild(btnsBlock);

    editBlock.appendChild(nameInput);
    editBlock.appendChild(dateAmountEditBlock);
    editBlock.appendChild(btnsEditBlock);

    expense.appendChild(expenseNumber);
    expense.appendChild(content);
    expense.appendChild(editBlock);
    expensesList.appendChild(expense);
  });
};
