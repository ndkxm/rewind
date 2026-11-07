package com.rewind.app.media;

import com.rewind.app.media.application.MediaService;
import com.rewind.app.media.application.dto.MediaResponse;
import com.rewind.app.media.domain.ProcessingStatus;
import com.rewind.app.media.presentation.MediaController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MediaController.class)
class MediaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MediaService mediaService;

    @Test
    void uploadMedia_ShouldReturnCreated_WhenValidImage() throws Exception {
        UUID mediaId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "receipt.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "fake image content".getBytes()
        );

        MediaResponse expectedResponse = new MediaResponse(
                mediaId,
                userId,
                "users/" + userId + "/" + mediaId + ".jpg",
                "https://example.com/signed/" + mediaId,
                "receipt.jpg",
                "receipt.jpg",
                "image/jpeg",
                18L,
                1080,
                1920,
                Instant.now(),
                ProcessingStatus.UPLOADED,
                Instant.now(),
                Instant.now()
        );

        when(mediaService.uploadMedia(eq(userId), any(), eq(1080), eq(1920), any(), any(), eq("KEEP_ORIGINAL")))
                .thenReturn(expectedResponse);

        mockMvc.perform(multipart("/api/v1/media")
                        .file(file)
                        .param("width", "1080")
                        .param("height", "1920")
                        .param("namingStrategy", "KEEP_ORIGINAL")
                        .header("X-User-Id", userId.toString()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(mediaId.toString()))
                .andExpect(jsonPath("$.originalFilename").value("receipt.jpg"))
                .andExpect(jsonPath("$.title").value("receipt.jpg"))
                .andExpect(jsonPath("$.mimeType").value("image/jpeg"))
                .andExpect(jsonPath("$.processingStatus").value("UPLOADED"));
    }

    @Test
    void uploadBatchMedia_ShouldReturnCreated_WhenMultipleImages() throws Exception {
        UUID userId = UUID.randomUUID();
        MockMultipartFile file1 = new MockMultipartFile("files", "img1.jpg", MediaType.IMAGE_JPEG_VALUE, "1".getBytes());
        MockMultipartFile file2 = new MockMultipartFile("files", "img2.jpg", MediaType.IMAGE_JPEG_VALUE, "2".getBytes());

        UUID id1 = UUID.randomUUID();
        UUID id2 = UUID.randomUUID();

        MediaResponse res1 = new MediaResponse(
                id1, userId, "path1", "https://signed.url/1", "img1.jpg", null,
                "image/jpeg", 1L, null, null, Instant.now(), ProcessingStatus.UPLOADED, Instant.now(), Instant.now()
        );
        MediaResponse res2 = new MediaResponse(
                id2, userId, "path2", "https://signed.url/2", "img2.jpg", null,
                "image/jpeg", 1L, null, null, Instant.now(), ProcessingStatus.UPLOADED, Instant.now(), Instant.now()
        );

        when(mediaService.uploadBatchMedia(eq(userId), any(), eq("AI_GENERATED")))
                .thenReturn(List.of(res1, res2));

        mockMvc.perform(multipart("/api/v1/media/batch")
                        .file(file1)
                        .file(file2)
                        .param("namingStrategy", "AI_GENERATED")
                        .header("X-User-Id", userId.toString()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(id1.toString()))
                .andExpect(jsonPath("$[1].id").value(id2.toString()));
    }

    @Test
    void getUserMedia_ShouldReturnList() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID mediaId = UUID.randomUUID();

        MediaResponse item = new MediaResponse(
                mediaId,
                userId,
                "path",
                "https://signed.url",
                "doc.png",
                "image/png",
                100L,
                null,
                null,
                Instant.now(),
                ProcessingStatus.UPLOADED,
                Instant.now(),
                Instant.now()
        );

        when(mediaService.getUserMedia(userId)).thenReturn(List.of(item));

        mockMvc.perform(get("/api/v1/media")
                        .header("X-User-Id", userId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(mediaId.toString()))
                .andExpect(jsonPath("$[0].originalFilename").value("doc.png"));
    }
}
