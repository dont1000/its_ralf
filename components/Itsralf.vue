<template>
  <div class="container">
    <div class="header">Ralf Braitling</div>

    <div class="two-column-layout">
      <div class="left-column">
        <div class="content">
          <h1>
            <div class="secondary">Hi I'm Ralf,</div>
            nice to meet you
          </h1>
          <div>
            <p>
              seit 20 Jahren im Web-Business – von Agenturen über Startups bis
              zum eigenen Business.
            </p>

            <p>
              Erfahrener Webentwickler, Teamlead und Product Owner mit
              Leidenschaft für agile Produktentwicklung und nutzerzentrierte
              Lösungen. Expertise in Frontend, API-Integration und
              datengetriebener Optimierung.
            </p>

            <p>Gerne erzähle ich dir im Chatbot unten mehr über mich.</p>

            Noch lieber aber in einem persönlichen Gespräch – ich freue mich
            darauf!
          </div>
          <cst-button class="cst-button"><span class="primary">@</span> Contact</cst-button>

        </div>
      </div>

      <div class="right-column">
        <div class="chat-container">
          <!-- <div class="bottom-content"> -->
            <div class="messages">
              <div  
                v-for="(msg, index) in reversedMessages"
                :key="index"
                :class="['message', msg.role]"
              >
                <div class="message-content" :class="{ expanded: expandedMessages[index] }">
                  {{ msg.content }}
                </div>
                <button 
                  v-if="isMessageTooLong(msg.content)" 
                  class="more-button"
                  @click="toggleMessage(index)"
                >
                  {{ expandedMessages[index] ? 'Less' : 'More' }}
                </button>
              </div>
              <div v-if="isLoading" class="message assistant">typing...</div>
            </div>
            <div class="background-image"></div>
            <form @submit.prevent="handleSubmit" class="chat-form">
              <div class="input-container">
                <input
                  v-model="input"
                  type="text"
                  placeholder="Type your question..."
                  :disabled="isLoading"
                />
                <img 
                  src="@/assets/images/Vector.svg" 
                  alt="Send" 
                  class="send-icon"
                  @click="handleSubmit"
                />
              </div>
    
            </form>
          <!-- </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">


// Message interface
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatResponse {
  threadId?: string;
  reply: string;
}

interface ChatRequest {
  message: string;
  threadId: string | null;
}

// Conversation state
const messages = ref<Message[]>([]);
const input = ref<string>("");
const isLoading = ref<boolean>(false);
// Store the thread ID once created
const threadId = ref<string | null>(null);
const reversedMessages = computed(() => [...messages.value].reverse())

const expandedMessages = ref<Record<number, boolean>>({});

const handleSubmit = async (): Promise<void> => {
  // if (!input.value.trim()) return;
  // Append the user's message
  const message: string = input.value;
  const userMessage: Message = { role: "user", content: message };
  messages.value.unshift(userMessage); // add prompt to local messages list
  input.value = "";
  isLoading.value = true;

  try {
    // Send prompt and current threadId (if any) to your server endpoint
    const response: ChatResponse = await $fetch("/api/chat", {
      method: "POST",
      body: {
        message: message,
        threadId: threadId.value, // may be null on first message
      },
    });

    // If a new thread was opened, store its ID for future calls
    if (!threadId.value && response.threadId) {
      threadId.value = response.threadId;
    }
    //add response to local messages list
    const assistantMessage: Message = {
      role: "assistant",
      content: response.reply,
    };
    messages.value.unshift(assistantMessage);
    console.log("messages",messages.value)
  } catch (error) {
    console.error("Error fetching assistant response:", error);
    // messages.value.push({
    //   role: "assistant",
    //   content: "I'm sorry, something went wrong. Please try again.",
    // });
  } finally {
    isLoading.value = false;
  }
};

const isMessageTooLong = (content: string) => {
  const tempDiv = document.createElement('div');
  tempDiv.style.width = '247px'; // max-width of message
  tempDiv.style.fontSize = '0.875rem';
  tempDiv.style.lineHeight = '1rem';
  tempDiv.innerText = content;
  document.body.appendChild(tempDiv);
  const height = tempDiv.offsetHeight;
  document.body.removeChild(tempDiv);
  return height > 100;
};

const toggleMessage = (index: number) => {
  expandedMessages.value[index] = !expandedMessages.value[index];
};
</script>

<style scoped>
.container {
  width: 100%;
  min-height: 100vh;
  max-width: 100% !important;
  background-color: rgb(255, 243, 227);
}

.two-column-layout {
  display: flex;
  width: 100%;
  gap: 2rem;
  padding: 0 2rem;
  height: calc(100vh - 70px); /* Adjust the 60px based on your header height */
  overflow: visible;
}
.left-column{
  width: 30%;
}

.right-column {
  width: 70%;
  overflow: visible;
}


.left-column>.content{
  width:100%;
  margin-top:8rem;
  font-size:0.925rem;
}

.header {
  display: flex;
  width: 1440px;
  height: 65px;
  padding: 22px 1236px 23px 40px;
  align-items: center;
  flex-shrink: 0;
  color: #0396ff;
  font-size: 28px;
  font-style: normal;
  font-weight: 700;
  line-height: 20px;
}

.chat-container {
  position: relative;
  width: 100%;
  height: 100%;
  margin: -4rem -2rem;
  padding: 1rem;

  overflow: visible;
  display: flex;
  flex-direction: column;

  background-image: url("@/assets/images/background image.png");
  background-position:bottom;
  background-repeat: no-repeat;
  background-size:55%;
}

.messages {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
  position: absolute;
  z-index: 99;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100% - 70px);
  justify-content: flex-end;
  padding-right:30px;
  overflow: visible;
}

.message {
  padding: .7rem 1rem; 
  margin-bottom: 2rem;
  min-width: 100px;
  max-width: 300px;
  font-size: 0.875rem;
  line-height: 1rem;
  min-height: auto; /* Remove fixed min-height */
  border-width: 1px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  border-bottom-left-radius: 20px;

}


.message.user {
  background-color: #fff;
  text-align: left;
  border-top-right-radius: 0;
  align-self: flex-start;
}

.message.assistant {
  background-color: #0396ff;
  border-top-left-radius: 0;
  color: #fff;
  text-align: left;
  align-self: flex-end;
}

.chat-form {
  position: relative;
  z-index: 3;
  display: flex;
  justify-content: center;
   height:100%;
}

.input-container {
  position: absolute;
  width: 65%; /* Container width */
  bottom:-1.5rem;
  margin-left:-3rem;
 
}

.chat-form input {
  width: 100% !important; /* Force width to fill container */
  padding: 0.5rem;
  padding-right: 2.5rem; /* Make room for icon */
  font-size: 1rem;
  border-radius: 5px;
  box-shadow: 0px 4px 4px 0px #00000040 inset;
  background-color: #fff;
  display: flex;
  justify-content: center;
 
}

.send-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px; /* Adjust size as needed */
  height: 20px;
  cursor: pointer;
}
.cst-button{
  margin-top:2em;
}

.chat-form button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
}



.background-image {
  width: 100%;
  height: 500px;
  position: relative;
  overflow: visible;
}

.background-image::before {
  /*content: "";*/
  position: absolute;
  top: -200px;
  left: 0;
  width: 100%;
  height: calc(100% + 200px);
  background: radial-gradient(
    45.7% 54.7% at 50% 50%,
    #0396ff 0%,
    rgba(255, 243, 227, 0.44) 100%
  );
    background-size:cover;
  z-index: 1;
  display: block;
}

.background-image::after {
  /*content: "";*/
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("@/assets/images/background image.png");
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  z-index: 2;
}

.message-content {
  max-height: 100px;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.message-content.expanded {
  max-height: none;
}

.more-button {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px;
  margin-top: 8px;
  text-decoration: underline;
}
</style>
