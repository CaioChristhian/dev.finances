const Modal = {
    open(){
        // Abrir modal
        // Adicionar a class active ao modal
        document.querySelector('.modal-overlay').classList.add('active')
    },

    close(){
        // Fechar o modal
        // Remover a class active do modal
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        app.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        app.reload()
    },

    incomes() {
        let income = 0;
        //pegar todas as transações 
        //para cada transação
        Transaction.all.forEach(transaction => {
            //se for maior que 0
            if(transaction.amount > 0) {
                income += transaction.amount;
                //somar a uma variavel
            }
        })

        return income;
    },

    expenses() {
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0) {
                expense += transaction.amount;
            }
        })

        return expense;
    },

    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransection(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransection(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expanse"

        const amount = Useful.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
        </td>
        `

        return html
    },

    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Useful.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = Useful.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay').innerHTML = Useful.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Useful = {
    formatAmount(value) {
        value = value * 100
        
        return Math.round(value)
    },

    formatDate(date) {
       const splittedDate = date.split("-")

       return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return{
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues()
        
        if(description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Useful.formatAmount(amount)

        date = Useful.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            // verificar se todas as informações foram preenchidas
            Form.validateFields()
            // formatar os dados para salvar
            const transaction = Form.formatValues()
            // salvar
            Transaction.add(transaction)
            // apagar os dados do formulário
            Form.clearFields()
            // modal feche
            Modal.close()
            // atualizar a aplicação
        } catch (error) {
            alert(error.message)
        }
    }
}

const app = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)

        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        app.init()
    },
}

app.init()

