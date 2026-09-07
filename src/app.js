document.addEventListener("alpine:init", () => {
  Alpine.data("products", () => ({
    items: [
      { id: 1, name: "Robusta Brazil", img: "1.jpg", price: 20000 },
      { id: 2, name: "Arabica Blend", img: "2.jpg", price: 25000 },
      { id: 3, name: "Primo Passo", img: "3.jpg", price: 30000 },
      { id: 4, name: "Aceh Gayo", img: "4.jpg", price: 35000 },
      { id: 5, name: "Sumatra Mandheling", img: "5.jpg", price: 25000 },
    ],
  }));

  Alpine.store("cart", {
    items: [],
    total: 0,
    quantity: 0,
    add(newItem) {
      // Check If The Cart Have Same Product
      const cartItem = this.items.find((item) => item.id === newItem.id);

      // If The Product is not Same / Or If The Cart Still Empty
      if (!cartItem) {
        this.items.push({ ...newItem, quantity: 1, total: newItem.price });
        this.quantity++;
        this.total += newItem.price;
      } else {
        // If Product Alredy On The Cart, Check If Product Is The Same Or Difrent
        this.items = this.items.map((item) => {
          // If The Product Is Difrent
          if (item.id !== newItem.id) {
            return item;
          }
          // If Product Alredy There, Add Quantity And Will Be Tottaled
          item.quantity++;
          item.total = item.price * item.quantity;
          this.quantity++;
          this.total += item.price;
          return item;
        });
      }
    },
    remove(id) {
      const cartItem = this.items.find((item) => item.id === id);

      if (cartItem.quantity > 1) {
        this.items = this.items.map((item) => {
          if (item.id !== id) {
            return item;
          }

          item.quantity--;
          item.total = item.price * item.quantity;
          return item;
        });

        this.quantity--;
        this.total -= cartItem.price;
      } else if (cartItem.quantity === 1) {
        this.items = this.items.filter((item) => item.id !== id);

        this.quantity--;
        this.total -= cartItem.price;
      }
    },
  });
});

// Form Validation
const checkoutButton = document.querySelector(".checkout-button");
checkoutButton.disabled = true;

const form = document.querySelector("#checkoutForm");

form.addEventListener("keyup", function () {
  for (let i = 0; i < form.elements.length; i++) {
    if (form.elements[i].value.length !== 0) {
      checkoutButton.classList.remove("disabled");
    } else {
      return false;
    }
  }

  checkoutButton.disabled = false;
  checkoutButton.classList.remove("disabled");
});

// Sent Data When Checkout Button Get Clicked

checkoutButton.addEventListener("click", async function (e) {
  e.preventDefault();

  const formData = new FormData(form);
  const data = new URLSearchParams(formData);

  data.append("items", JSON.stringify(Alpine.store("cart").items));
  data.append("total", Alpine.store("cart").total);

  const objData = Object.fromEntries(data);

  // const message = formatMessage(objData);

  // window.open("http://wa.me/6287714249393?text=" + encodeURIComponent(message));

  // Request Transaction Token Using Ajax / Fetch

  try {
    const response = await fetch("php/placeOrder.php", {
      method: "POST",
      body: data,
    });

    const token = await response.text();
    // console.log(token);
    window.snap.pay(token);
  } catch (err) {
    console.log(err.message);
  }
});

// Format To WhatsApp

const formatMessage = (obj) => {
  return `Data Customer*

Nama: ${obj.name}
Email: ${obj.email}
No HP: ${obj.phone}

Data Pesanan

${JSON.parse(obj.items)
  .map((item) => `${item.name} (${item.quantity} x ${rupiah(item.total)})`)
  .join("\n")}

TOTAL: ${rupiah(obj.total)}

Terima Kasih.`;
};

// Convert To RP
const rupiah = (Number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    // minimumFractionDigits: 0,
  }).format(Number);
};
