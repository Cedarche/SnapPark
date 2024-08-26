// typings.d.ts

declare module 'jspdf' {
    interface jsPDFAPI {
      callAddFont?: () => void; // Assuming callAddFont is a method with no parameters and no return value
    }
  }
  