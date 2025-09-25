'use client';
import {
    Box, Typography, TextField, IconButton, List, ListItem, ListItemText,
    Avatar, InputAdornment, CircularProgress, Paper
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { PlusIcon, SearchIcon } from "lucide-react";
import { useState, useEffect } from "react";

const ConversationBox = (props: any) => {
    const {
        messages,
        sendMessage,
        setMessages,
        threadInput,
        setThreadInput,
        filteredUsers,
        message,
        setMessage,
        isThreadsLoading,
        isMessagesLoading,
        handleTyping,
        typingUser,
    } = props;

    const [isTyping, setIsTyping] = useState(false);
    const [fileErrorMsg, setFileErrorMsg] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //   setMessage(e.target.value);
    // };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileErrorMsg(""); // Clear previous error messages
            setSelectedFile(null); // Reset previous file selection

            const validTypes = ["image/jpeg", "image/png", "application/pdf"];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!validTypes.includes(file.type)) {
                setFileErrorMsg("Invalid file type. Only JPG, PNG, and PDF are allowed.");
                return;
            }
            if (file.size > maxSize) {
                setFileErrorMsg("File size exceeds the 5MB limit.");
                return;
            }

            setSelectedFile(file); // Set the valid file
        }
    };
    const handleInputChange = (e: any) => {
        const value = e.target.value;
        setMessage(value);

        if (!isTyping) {
            setIsTyping(true);
            handleTyping(true);
        }

        if (value.trim() === '') {
            setIsTyping(false);
            handleTyping(false);
        }
    };

    useEffect(() => {
        const typingTimeout = setTimeout(() => {
            if (isTyping) {
                setIsTyping(false);
                handleTyping(false); // Stop typing after a timeout
            }
        }, 2000); // Timeout duration for typing status

        return () => clearTimeout(typingTimeout);
    }, [isTyping]);

    return (
        <Box
            sx={{
                display: "flex",
                width: "900px",
                height: "600px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: 2,
                backgroundColor: "#fefefe",
                overflow: "auto",
            }}
        >
            {/* Threads Section */}
            <Box
                sx={{
                    width: "30%",
                    paddingRight: 2,
                    borderRight: "1px solid #ddd",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Typography variant="h6" gutterBottom>
                    Threads
                </Typography>
                <TextField
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={threadInput}
                    onChange={(e) => setThreadInput(e.target.value)}
                    placeholder="Search threads..."
                    sx={{ marginBottom: 2 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                <Box
                    sx={{
                        flex: 1,
                        overflowY: "auto",
                        display: "flex",
                        justifyContent: isThreadsLoading ? "center" : "flex-start",
                        alignItems: isThreadsLoading ? "center" : "stretch",
                        flexDirection: "column",
                    }}
                >
                    {isThreadsLoading ? (
                        <CircularProgress sx={{ color: "#EA5C15" }} />
                    ) : filteredUsers?.length === 0 ? (
                        <Typography sx={{ textAlign: "center", color: "#aaa", marginTop: 2 }}>
                            No threads found.
                        </Typography>
                    ) : (
                        <List>
                            {filteredUsers?.map((user: any, index: number) => (
                                <ListItem
                                    key={index}
                                    sx={{
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        marginTop: "2px",
                                        padding: 1,
                                        "&:hover": {
                                            borderRadius: "10px",
                                            backgroundColor: "#f0f0f0",
                                        },
                                    }}
                                >
                                    <Avatar
                                        sx={{ width: 30, height: 30, marginRight: 1 }}
                                        alt={user}
                                        src={`https://i.pravatar.cc/40?img=${index + 1}`}
                                    />
                                    <ListItemText
                                        primary={user}
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#333",
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </Box>
            <Box
                sx={{
                    width: "70%",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                }}
            >
                <Box
                    sx={{
                        flex: 1,
                        padding: "10px",
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column-reverse",
                        justifyContent: isMessagesLoading ? "center" : "flex-start",
                        alignItems: isMessagesLoading ? "center" : "stretch",
                    }}
                >
                    {isMessagesLoading ? (
                        <CircularProgress sx={{ color: "#EA5C15" }} />
                    ) : messages?.length === 0 ? (
                        <Typography sx={{ textAlign: "center", color: "#aaa", marginTop: 2 }}>
                            No conversation found
                        </Typography>
                    ) : (
                        <>
                            {messages?.map((message: any, index: number) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: "flex",
                                        flexDirection: message.sender === "You" ? "row-reverse" : "row",
                                        alignItems: "flex-start",
                                        marginBottom: "10px",
                                    }}
                                >
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            padding: "10px",
                                            backgroundColor: message.sender === "You" ? "rgb(232 128 76 / var(--tw-bg-opacity))" : "#F7F2EB",
                                            maxWidth: "70%",
                                            borderRadius: "10px",
                                        }}
                                    >
                                        {message.type === "text" ? (
                                            <>
                                                <Typography variant="body2" sx={{ margin: 0 }}>
                                                    {message.text}
                                                </Typography>
                                            </>
                                        ) : (
                                            <>
                                                <Typography variant="body2" sx={{ marginBottom: "5px" }}>
                                                    File:{" "}
                                                    <a
                                                        href={message.file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ textDecoration: "underline", color: "blue" }}
                                                    >
                                                        {message.file.name}
                                                    </a>
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        display: "block",
                                                        color: "#aaa",
                                                    }}
                                                >
                                                    Size: {message.file.size}
                                                </Typography>
                                            </>
                                        )}
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                display: "block",
                                                marginTop: "5px",
                                                textAlign: message.sender === "You" ? "right" : "left",
                                                color: message.sender === "You" ? "white" : "#aaa",
                                            }}
                                        >
                                            {message.timestamp}
                                        </Typography>
                                    </Paper>
                                </Box>
                            ))}
                        </>
                    )}
                </Box>

                {typingUser && (
                    <Typography sx={{ color: "#aaa", marginLeft: "20px", fontStyle: "italic", margin: "10px 0" }}>
                        {typingUser}&nbsp;&nbsp;&nbsp;Mausam is typing...
                    </Typography>
                )}
                {/* Chat Input */}
                {fileErrorMsg && (
                    <Typography
                        variant="caption"
                        sx={{
                            color: "error.main",
                            textAlign: "right",
                            marginTop: "5px",
                            marginRight: "25px"
                        }}
                    >
                        {fileErrorMsg}
                    </Typography>
                )}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "10px",
                    }}
                >
                    {/* Input Field with Icons */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <TextField
                            variant="outlined"
                            size="medium"
                            placeholder="Type a message"
                            value={message}
                            onChange={handleInputChange}
                            sx={{ flex: 1, marginRight: "10px" }}
                            InputProps={{
                                endAdornment: (
                                    <>
                                        {/* File Upload Icon */}
                                        <IconButton
                                            color="primary"
                                            component="label"
                                            sx={{ marginRight: "10px" }}
                                        >
                                            <input type="file" hidden onChange={handleFileChange} />
                                            <PlusIcon />
                                        </IconButton>

                                        {/* Send Message Icon */}
                                        <IconButton color="primary" onClick={sendMessage}>
                                            <SendIcon />
                                        </IconButton>
                                    </>
                                ),
                            }}
                        />
                    </Box>
                    {/* File Preview */}
                    {selectedFile && (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                marginTop: "10px",
                                backgroundColor: "#f7f7f7",
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid #ddd",
                                maxWidth: "100%",
                                width: { xs: "100%", sm: "580px" },
                                position: "relative",
                                flexDirection: { xs: "column", sm: "row" },
                            }}
                        >
                            {selectedFile.type.startsWith("image/") ? (
                                <img
                                    src={URL.createObjectURL(selectedFile)}
                                    alt="Selected File"
                                    style={{
                                        width: "45px",
                                        height: "50px",
                                        objectFit: "cover",
                                        marginRight: "10px",
                                        borderRadius: "4px",
                                    }}
                                />
                            ) : (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: "#555",
                                        marginRight: { xs: 0, sm: "10px" },
                                        textAlign: { xs: "center", sm: "left" },
                                        marginBottom: { xs: "10px", sm: 0 },
                                    }}
                                >
                                    {selectedFile.name} &nbsp;&nbsp;&nbsp;
                                    {selectedFile.size / 1024 > 1024
                                        ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                                        : `${(selectedFile.size / 1024).toFixed(2)} KB`}
                                </Typography>
                            )}

                            {/* Remove File Icon */}
                            <IconButton
                                size="small"
                                sx={{
                                    position: { xs: "static", sm: "absolute" },
                                    top: { sm: "5px" },
                                    right: { sm: "5px" },
                                    alignSelf: { xs: "flex-end", sm: "center" },
                                    color: "#aaa",
                                    marginTop: { xs: "-10px", sm: 0 },
                                }}
                                onClick={() => {
                                    setSelectedFile(null)
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    style={{ width: "16px", height: "16px" }}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </IconButton>
                        </Box>
                    )}

                </Box>

            </Box>
        </Box>
    );
};

export default ConversationBox;
