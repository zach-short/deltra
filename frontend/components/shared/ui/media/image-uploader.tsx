import { useState } from "react";
import { Alert, StyleSheet, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Image } from "expo-image";
import { Text, Pressable, View } from "@/components";
import { useAuth, useToast } from "@/context";
import { useProtectedAction } from "@/hooks";
import { userApi } from "@/utils";

interface UploadedFile {
  key: string;
  url: string;
  name: string;
  size: number;
}

interface ImageUploaderProps {
  fileType?: "listingImages" | "profileImage";
  maxFiles?: number;
  onUploadSuccess?: (files: UploadedFile[]) => void;
  onUploadError?: (error: string) => void;
}

export function ImageUploader({
  fileType = "listingImages",
  maxFiles = 3,
  onUploadSuccess,
  onUploadError,
}: ImageUploaderProps) {
  const { user } = useAuth();
  const { Toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const { execute: performUploadToServer, loading: uploading } =
    useProtectedAction(userApi.uploadImages, {
      onSuccess: (data) => {
        if (data?.file) {
          const newFile = data.file;
          setUploadedFiles((prev) => [...prev, newFile]);
          Toast({
            message: `Successfully uploaded ${newFile.name}`,
            duration: 2000,
          });
          onUploadSuccess?.([newFile]);
        }
      },
      onError: (error) => {
        console.error("Upload error:", error);
        const errorMessage = error?.message || "Upload failed";
        Toast({ message: errorMessage });
        onUploadError?.(errorMessage);
      },
    });

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need camera roll permissions to upload images.",
        [{ text: "OK" }],
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: fileType === "listingImages",
        selectionLimit: maxFiles,
      });

      if (!result.canceled && result.assets) {
        await uploadFiles(result.assets);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Toast({ message: "Error selecting image" });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need camera permissions to take photos.",
        [{ text: "OK" }],
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        await uploadFiles(result.assets);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Toast({ message: "Error taking photo" });
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        multiple: fileType === "listingImages",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        await uploadFiles(result.assets);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Toast({ message: "Error selecting file" });
    }
  };

  const uploadFiles = async (assets: any[]) => {
    if (!user?.id) {
      Toast({ message: "Please log in to upload files" });
      return;
    }

    setUploadProgress(0);
    const results: UploadedFile[] = [];

    try {
      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        setUploadProgress(((i + 1) / assets.length) * 100);

        const formData = new FormData();

        // Create file object
        const fileUri = asset.uri;
        const fileName = asset.fileName || `image_${Date.now()}.jpg`;
        const fileType_mime = asset.mimeType || "image/jpeg";

        // Append file to FormData
        formData.append("file", {
          uri: fileUri,
          type: fileType_mime,
          name: fileName,
        } as any);

        // Append fileType
        formData.append("fileType", fileType);

        try {
          const response = await uploadToServer(formData);
          if (response?.file) {
            results.push(response.file);
          }
        } catch (error) {
          console.error(`Error uploading file ${i + 1}:`, error);
          Toast({
            message: `Failed to upload ${fileName}`,
            description:
              error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      if (results.length > 1) {
        Toast({
          message: `Successfully uploaded ${results.length} files total`,
          duration: 2000,
        });
        onUploadSuccess?.(results);
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      Toast({ message: errorMessage });
      onUploadError?.(errorMessage);
    } finally {
      setUploadProgress(0);
    }
  };

  const uploadToServer = async (formData: FormData): Promise<any> => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    try {
      // Use the protected action which handles authentication automatically
      return await performUploadToServer(formData);
    } catch (error) {
      console.error("Server upload error:", error);
      throw error;
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const showImagePicker = () => {
    Alert.alert("Select Image", "Choose how you want to select an image", [
      { text: "Camera", onPress: takePhoto },
      { text: "Photo Library", onPress: pickImage },
      { text: "Files", onPress: pickDocument },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
        onPress={showImagePicker}
        disabled={uploading}
        wrapInText={false}
      >
        {uploading ? (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.uploadButtonText}>
              Uploading... {Math.round(uploadProgress)}%
            </Text>
          </View>
        ) : (
          <Text style={styles.uploadButtonText}>
            {fileType === "profileImage"
              ? "Upload Profile Image"
              : "Upload Images"}
          </Text>
        )}
      </Pressable>

      {/* Upload Progress */}
      {uploading && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
        </View>
      )}

      {/* Uploaded Files Grid */}
      {uploadedFiles.length > 0 && (
        <View style={styles.filesContainer}>
          <Text style={styles.filesTitle}>Uploaded Files:</Text>
          <View style={styles.filesGrid}>
            {uploadedFiles.map((file, index) => (
              <View key={file.key} style={styles.fileItem}>
                <Image
                  source={{ uri: file.url }}
                  style={styles.fileImage}
                  contentFit="cover"
                />
                <Pressable
                  style={styles.removeButton}
                  onPress={() => removeFile(index)}
                  textProps={{ style: styles.removeButtonText }}
                >
                  ×
                </Pressable>
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.name}
                </Text>
                <Text style={styles.fileSize}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Test Configuration:</Text>
        <Text style={styles.infoText}>File Type: {fileType}</Text>
        <Text style={styles.infoText}>Max Files: {maxFiles}</Text>
        <Text style={styles.infoText}>
          User ID: {user?.id || "Not logged in"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  uploadButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  uploadButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressContainer: {
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    marginBottom: 16,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#16a34a",
  },
  filesContainer: {
    marginBottom: 16,
  },
  filesTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  filesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  fileItem: {
    width: 120,
    alignItems: "center",
  },
  fileImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  fileName: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    color: "#374151",
  },
  fileSize: {
    fontSize: 10,
    textAlign: "center",
    color: "#6b7280",
  },
  infoContainer: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
});
