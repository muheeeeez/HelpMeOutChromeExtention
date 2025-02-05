<template>
  <div class="hero">
    <img src="../assets/images/arrow.png" alt="arrow" @click="goBack" />
    <div class="form-box">
      <div class="button-box">
        <div id="btn"></div>
        <button type="button" class="toggle-btn">Forgot Password</button>
      </div>

      <form class="input-group" id="login" @submit.prevent="resetPassword">
        <input
          type="email"
          class="input-field"
          placeholder="Email"
          required
          v-model="email"
        /><button type="submit" class="submit-btn">Send Verification</button>
      </form>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth } from "../../public/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useToast } from "vue-toast-notification";
const email = ref("");
const router = useRouter();
const toast = useToast();
const resetPassword = () => {
  sendPasswordResetEmail(auth, email.value)
    .then((data) => {
      // console.log('Reset Password Verification Sent')
      console.log(data);
      toast.success("Reset Password Verification Sent", {
        position: "top-right",
      });
      router.push("/auth");
    })
    .catch((error) => {
      console.log(error.code);
      alert(error.message);
      toast.error("Forgot Password: " + error.message, {
        position: "top-right",
      });
    });
};

function goBack() {
  router.push("/auth");
}
</script>
<style scoped>
* {
  margin: 0;
  padding: 0;
  font-family: sans-serif;
}
img {
  width: 20px;
  height: 20px;
  cursor: pointer;
}
.hero {
  height: 100%;
  width: 100%;
  /* background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
    url(../assets/images/woman.jpg); */
  /* background-position: center;
  background-size: cover; */
  /* position: absolute; */
}
.form-box {
  width: 380px;
  height: 480px;
  position: relative;
  margin: 6% auto;
  background: #fff;
  padding: 5px;
  overflow: hidden;
}
.button-box {
  width: 220px;
  margin: 35px;
  position: relative;
  box-shadow: 0 0 20px 9px #ff61241f;
  border-radius: 30px;
}
.toggle-btn {
  padding: 10px 30px;
  cursor: pointer;
  background: transparent;
  border: 0;
  outline: none;
  position: relative;
  display: flex;
  text-align: center;
  margin: 0 auto;
  color: #fff;
}
#btn {
  top: 0;
  left: 0;
  position: absolute;
  width: 220px;
  height: 100%;
  background: linear-gradient(to right, #ff105f, #ffad06);
  border-radius: 30px;
  transition: 0.5s;
}
.input-group {
  top: 180px;
  position: absolute;
  width: 280px;
  transition: 0.5s;
}
.input-field {
  width: 100%;
  padding: 10px 0;
  margin: 5px 0;
  border-left: 0;
  border-top: 0;
  border-right: 0;
  border-bottom: 1px solid #999;
  outline: none;
  background: transparent;
}
.submit-btn {
  width: 85%;
  padding: 10px 30px;
  cursor: pointer;
  display: block;
  margin: 20px auto;
  /* background: linear-gradient(to right, #ff105f, #ffad06); */
  background-color: #1b233d;
  color: #fff;
  border: 0;
  outline: none;
  border-radius: 30px;
}
</style>
