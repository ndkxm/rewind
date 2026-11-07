package com.rewind.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;

@SpringBootApplication
public class RewindApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(RewindApplication.class, args);
    }

    private static void loadDotEnv() {
        File[] candidates = {
                new File(".env"),
                new File("../.env"),
                new File("../../.env")
        };

        for (File file : candidates) {
            if (file.exists() && file.isFile()) {
                try {
                    for (String line : Files.readAllLines(file.toPath())) {
                        String trimmed = line.trim();
                        if (!trimmed.isEmpty() && !trimmed.startsWith("#") && trimmed.contains("=")) {
                            int eqIdx = trimmed.indexOf('=');
                            String key = trimmed.substring(0, eqIdx).trim();
                            String value = trimmed.substring(eqIdx + 1).trim();
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                    break;
                } catch (IOException ignored) {
                }
            }
        }
    }
}
