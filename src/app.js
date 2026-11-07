document.addEventListener("alpine:init", () => {
  Alpine.data("products", () => ({
    items: [
      {
        id: 1,
        name: "Robusta Brazil",
        img: "1.jpg",
        price: 20000,
        rating: 4.5,
        description:
          "Karakter kopi yang kuat dan bold, dengan sedikit rasa pahit yang khas serta aroma tanah yang kental. Cocok untuk kamu pecinta kopi hitam yang nendang.",
      },
      {
        id: 2,
        name: "Arabica Blend",
        img: "2.jpg",
        price: 25000,
        rating: 4.2,
        description:
          "Perpaduan biji arabika pilihan dengan rasa yang lebih lembut, sedikit asam segar, dan aroma yang harum. Pas diminum kapan saja.",
      },
      {
        id: 3,
        name: "Primo Passo",
        img: "3.jpg",
        price: 30000,
        rating: 4.8,
        description:
          "Racikan house blend andalan kami, seimbang antara rasa manis karamel dan sedikit rasa cokelat di akhir tegukan.",
      },
      {
        id: 4,
        name: "Aceh Gayo",
        img: "4.jpg",
        price: 35000,
        rating: 3.9,
        description:
          "Kopi khas dataran tinggi Gayo dengan body yang tebal, rasa rempah yang unik, dan after taste yang panjang.",
      },
      {
        id: 5,
        name: "Sumatra Mandheling",
        img: "5.jpg",
        price: 25000,
        rating: 4.6,
        description:
          "Kopi Sumatra dengan karakter earthy yang dalam, low acidity, serta sentuhan rasa herbal yang khas.",
      },
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

  // Store baru: nyimpen produk mana yang lagi dibuka detailnya di modal
  Alpine.store("modal", {
    show: false,
    item: null,
    open(item) {
      this.item = item;
      this.show = true;
    },
    close() {
      this.show = false;
    },
  });
});

// Ubah rating (0–5) jadi array 5 nilai persen isi bintang.
// Contoh: rating 4.5 -> [100, 100, 100, 100, 50] (4 bintang penuh + setengah)
const getStars = (rating) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    const diff = rating - i;
    let fill = 0;
    if (diff >= 1) fill = 100;
    else if (diff > 0) fill = Math.round(diff * 100);
    stars.push(fill);
  }
  return stars;
};

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