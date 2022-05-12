let allExpenses = JSON.parse(localStorage.getItem('expenses')) || [];
// let allExpenses = [];
let totalSpent = JSON.parse(localStorage.getItem('total')) || 0;

window.onload = () => {
  render();
};

const addExpense = e => {
  e.preventDefault();

  const nameInput = document.querySelector('#expense-name');
  const amountInput = document.querySelector('#expense-amount');
  const errorMessage = document.querySelector('.error-message');

  nameInput.addEventListener('keydown', removeErrorMessage);
  amountInput.addEventListener('keydown', removeErrorMessage);

  if (
    nameInput.value.trim() === '' ||
    amountInput.value.trim() === '' ||
    isNaN(amountInput.value)
  ) {
    nameInput.classList.add('error');
    amountInput.classList.add('error');
    errorMessage.classList.remove('hidden');
  } else {
    totalSpent += +amountInput.value;
    allExpenses.unshift({
      name: nameInput.value,
      amount: +amountInput.value,
      date: new Date(),
    });
  }

  localStorage.setItem('expenses', JSON.stringify(allExpenses));
  localStorage.setItem('total', JSON.stringify(totalSpent));
  nameInput.value = '';
  amountInput.value = '';
  render();
};

const deleteExpense = (amount, index) => {
  const updatedExpenses = allExpenses.filter((item, i) => i !== index);
  totalSpent -= amount;
  allExpenses = updatedExpenses;
  localStorage.setItem('expenses', JSON.stringify(allExpenses));
  localStorage.setItem('total', JSON.stringify(totalSpent));
  render();
};

const showEditFields = index => {};

const removeErrorMessage = () => {
  document.querySelector('#expense-name').classList.remove('error');
  document.querySelector('#expense-amount').classList.remove('error');
  document.querySelector('.error-message').classList.add('hidden');
};

const render = () => {
  document.querySelector('.sum-num').innerText = totalSpent;

  const expensesList = document.querySelector('.expenses');

  while (expensesList.firstChild) {
    expensesList.removeChild(expensesList.firstChild);
  }

  allExpenses.map((item, index) => {
    const { name, amount, date } = item;
    // li
    const expense = document.createElement('li');
    expense.id = `expense-item-${index}`;
    expense.className = 'expenses__item';

    // content box
    const content = document.createElement('div');
    content.className = 'content';

    const expenseNumber = document.createElement('p');
    expenseNumber.className = 'expense-number text';
    expenseNumber.innerText = `${index + 1})`;

    const contentName = document.createElement('p');
    contentName.id = `text-name-${index}`;
    contentName.className = 'text text-name';
    contentName.innerText = name;

    // date-amount box
    const dateAmountBlock = document.createElement('div');
    dateAmountBlock.className = 'date-amount-box';

    const dateElement = document.createElement('p');
    dateElement.id = `text-date-${index}`;
    dateElement.className = 'text';
    dateElement.innerText = moment(date).format('LL');

    const amountElement = document.createElement('p');
    amountElement.id = `text-amount-${index}`;
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
      showEditFields(index);
    };
    const editBtnImg = document.createElement('img');
    editBtnImg.src = 'img/edit_icon.png';
    editBtnImg.alt = 'pencil';
    editBtnImg.className = 'icon';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn expense-btn';
    deleteBtn.onclick = () => {
      deleteExpense(amount, index);
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
    editBlock.className = 'edit-block hidden'; //

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'edit-input name-input';

    // date-amount box
    const dateAmountEditBlock = document.createElement('div');
    dateAmountEditBlock.className = 'date-amount-box';

    const dateInput = document.createElement('input');
    dateInput.type = 'text';
    dateInput.id = `expense-edit-date-${index}`;
    dateInput.className = 'edit-input';

    const amountInput = document.createElement('input');
    amountInput.type = 'text';
    amountInput.id = `expense-edit-amount-${index}`;
    amountInput.className = 'edit-input';

    dateAmountEditBlock.appendChild(dateInput);
    dateAmountEditBlock.appendChild(amountInput);

    // edit btns
    const btnsEditBlock = document.createElement('div');
    btnsEditBlock.className = 'btns';

    const doneBtn = document.createElement('button');
    doneBtn.className = 'btn expense-btn';
    const doneBtnImg = document.createElement('img');
    doneBtnImg.src = 'img/done_icon.png';
    doneBtnImg.alt = 'checkmark';
    doneBtnImg.className = 'icon ';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn expense-btn';
    const cancelBtnImg = document.createElement('img');
    cancelBtnImg.src = 'img/close_icon.png';
    cancelBtnImg.alt = 'cross';
    cancelBtnImg.className = 'icon';

    doneBtn.appendChild(doneBtnImg);
    cancelBtn.appendChild(cancelBtnImg);
    btnsEditBlock.appendChild(doneBtn);
    btnsEditBlock.appendChild(cancelBtn);

    // final appending
    content.appendChild(expenseNumber);
    content.appendChild(contentName);
    content.appendChild(dateAmountBlock);
    content.appendChild(btnsBlock);
    expense.appendChild(content);

    editBlock.appendChild(nameInput);
    editBlock.appendChild(dateAmountEditBlock);
    editBlock.appendChild(btnsEditBlock);
    expense.appendChild(editBlock);
    expensesList.appendChild(expense);
  });
};
