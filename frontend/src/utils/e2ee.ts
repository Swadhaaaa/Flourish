/**
 * End-to-End Encryption Utility
 * Uses Web Crypto API for ECDH Key Agreement and AES-GCM for Message Encryption.
 */

// Generate a new ECDH KeyPair for the user
export async function generateKeyPair(): Promise<CryptoKeyPair> {
    return await window.crypto.subtle.generateKey(
        {
            name: "ECDH",
            namedCurve: "P-256", // standard curve
        },
        true, // exportable
        ["deriveKey", "deriveBits"]
    );
}

// Export Public Key to a Base64 string to store in Firestore
export async function exportPublicKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey("spki", key);
    const exportedAsString = String.fromCharCode.apply(null, new Uint8Array(exported) as any);
    return window.btoa(exportedAsString);
}

// Export Private Key to a Base64 string to store in IndexedDB or LocalStorage
export async function exportPrivateKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey("pkcs8", key);
    const exportedAsString = String.fromCharCode.apply(null, new Uint8Array(exported) as any);
    return window.btoa(exportedAsString);
}

// Import Public Key from Base64 string (from Firestore)
export async function importPublicKey(b64Key: string): Promise<CryptoKey> {
    const binaryDerString = window.atob(b64Key);
    const binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
        binaryDer[i] = binaryDerString.charCodeAt(i);
    }
    return await window.crypto.subtle.importKey(
        "spki",
        binaryDer.buffer,
        {
            name: "ECDH",
            namedCurve: "P-256",
        },
        true,
        []
    );
}

// Import Private Key from Base64 string
export async function importPrivateKey(b64Key: string): Promise<CryptoKey> {
    const binaryDerString = window.atob(b64Key);
    const binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
        binaryDer[i] = binaryDerString.charCodeAt(i);
    }
    return await window.crypto.subtle.importKey(
        "pkcs8",
        binaryDer.buffer,
        {
            name: "ECDH",
            namedCurve: "P-256",
        },
        true,
        ["deriveKey", "deriveBits"]
    );
}

// Derive a shared AES-GCM key using local private key and peer's public key
export async function deriveSharedSecret(privateKey: CryptoKey, publicKey: CryptoKey): Promise<CryptoKey> {
    return await window.crypto.subtle.deriveKey(
        {
            name: "ECDH",
            public: publicKey,
        },
        privateKey,
        {
            name: "AES-GCM",
            length: 256,
        },
        false, // not exportable
        ["encrypt", "decrypt"]
    );
}

// Encrypt a message using the shared AES key
export async function encryptMessage(sharedKey: CryptoKey, text: string): Promise<{ ciphertext: string; iv: string }> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);

    const ciphertextBuffer = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        sharedKey,
        encoded
    );

    const ciphertextB64 = window.btoa(String.fromCharCode.apply(null, new Uint8Array(ciphertextBuffer) as any));
    const ivB64 = window.btoa(String.fromCharCode.apply(null, new Uint8Array(iv) as any));

    return { ciphertext: ciphertextB64, iv: ivB64 };
}

// Decrypt a message using the shared AES key
export async function decryptMessage(sharedKey: CryptoKey, ciphertextB64: string, ivB64: string): Promise<string> {
    const ivString = window.atob(ivB64);
    const iv = new Uint8Array(ivString.length);
    for (let i = 0; i < ivString.length; i++) {
        iv[i] = ivString.charCodeAt(i);
    }

    const ciphertextString = window.atob(ciphertextB64);
    const ciphertext = new Uint8Array(ciphertextString.length);
    for (let i = 0; i < ciphertextString.length; i++) {
        ciphertext[i] = ciphertextString.charCodeAt(i);
    }

    try {
        const decryptedBuffer = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            sharedKey,
            ciphertext.buffer
        );
        return new TextDecoder().decode(decryptedBuffer);
    } catch (e) {
        console.error("Decryption failed", e);
        return "[Encrypted Message - Key Mismatch]";
    }
}
