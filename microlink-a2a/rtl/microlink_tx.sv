// μLink-A2A transmit framing skeleton.
// Production integration should connect auth_tag_i to a secure MAC engine and
// feed frame_data_o into a hardened SerDes/photonic PHY.
module microlink_tx #(
    parameter int PAYLOAD_W = 64
) (
    input  logic                 clk_i,
    input  logic                 rst_ni,
    input  logic                 start_i,
    input  logic [63:0]          sequence_i,
    input  logic [7:0]           message_type_i,
    input  logic [2:0]           priority_i,
    input  logic [PAYLOAD_W-1:0] payload_i,
    input  logic [255:0]         auth_tag_i,
    output logic                 valid_o,
    output logic [7:0]           frame_data_o,
    input  logic                 ready_i,
    output logic                 busy_o
);
    typedef enum logic [2:0] {IDLE, MAGIC, META, SEQ, AUTH, PAYLOAD} state_t;
    state_t state_q;
    logic [6:0] index_q;

    always_ff @(posedge clk_i or negedge rst_ni) begin
        if (!rst_ni) begin
            state_q      <= IDLE;
            index_q      <= '0;
            valid_o      <= 1'b0;
            frame_data_o <= '0;
            busy_o       <= 1'b0;
        end else begin
            valid_o <= 1'b0;
            case (state_q)
                IDLE: if (start_i) begin
                    state_q <= MAGIC;
                    index_q <= '0;
                    busy_o  <= 1'b1;
                end
                MAGIC: if (ready_i) begin
                    valid_o <= 1'b1;
                    case (index_q)
                        0: frame_data_o <= 8'h4D; // M
                        1: frame_data_o <= 8'h4C; // L
                        2: frame_data_o <= 8'h41; // A
                        default: frame_data_o <= 8'h32; // 2
                    endcase
                    if (index_q == 3) begin state_q <= META; index_q <= 0; end
                    else index_q <= index_q + 1'b1;
                end
                META: if (ready_i) begin
                    valid_o <= 1'b1;
                    case (index_q)
                        0: frame_data_o <= 8'h01;
                        1: frame_data_o <= message_type_i;
                        default: frame_data_o <= {5'b0, priority_i};
                    endcase
                    if (index_q == 2) begin state_q <= SEQ; index_q <= 0; end
                    else index_q <= index_q + 1'b1;
                end
                SEQ: if (ready_i) begin
                    valid_o <= 1'b1;
                    frame_data_o <= sequence_i[63 - index_q*8 -: 8];
                    if (index_q == 7) begin state_q <= AUTH; index_q <= 0; end
                    else index_q <= index_q + 1'b1;
                end
                AUTH: if (ready_i) begin
                    valid_o <= 1'b1;
                    frame_data_o <= auth_tag_i[255 - index_q*8 -: 8];
                    if (index_q == 31) begin state_q <= PAYLOAD; index_q <= 0; end
                    else index_q <= index_q + 1'b1;
                end
                PAYLOAD: if (ready_i) begin
                    valid_o <= 1'b1;
                    frame_data_o <= payload_i[PAYLOAD_W-1 - index_q*8 -: 8];
                    if (index_q == (PAYLOAD_W/8)-1) begin
                        state_q <= IDLE;
                        index_q <= 0;
                        busy_o  <= 1'b0;
                    end else index_q <= index_q + 1'b1;
                end
                default: state_q <= IDLE;
            endcase
        end
    end
endmodule
