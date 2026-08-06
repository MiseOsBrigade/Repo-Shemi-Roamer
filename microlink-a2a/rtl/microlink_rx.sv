// μLink-A2A receive parser skeleton. This block identifies the frame preamble
// and exposes bytes to a downstream authenticated-frame validator.
module microlink_rx (
    input  logic       clk_i,
    input  logic       rst_ni,
    input  logic       valid_i,
    input  logic [7:0] data_i,
    output logic       ready_o,
    output logic       frame_start_o,
    output logic       payload_valid_o,
    output logic [7:0] payload_data_o,
    output logic       framing_error_o
);
    logic [1:0] magic_index_q;
    logic       in_frame_q;
    logic [7:0] expected_magic;

    always_comb begin
        case (magic_index_q)
            2'd0: expected_magic = 8'h4D;
            2'd1: expected_magic = 8'h4C;
            2'd2: expected_magic = 8'h41;
            default: expected_magic = 8'h32;
        endcase
    end

    assign ready_o = 1'b1;

    always_ff @(posedge clk_i or negedge rst_ni) begin
        if (!rst_ni) begin
            magic_index_q   <= '0;
            in_frame_q      <= 1'b0;
            frame_start_o   <= 1'b0;
            payload_valid_o <= 1'b0;
            payload_data_o  <= '0;
            framing_error_o <= 1'b0;
        end else begin
            frame_start_o   <= 1'b0;
            payload_valid_o <= 1'b0;
            framing_error_o <= 1'b0;
            if (valid_i) begin
                if (!in_frame_q) begin
                    if (data_i == expected_magic) begin
                        if (magic_index_q == 2'd3) begin
                            in_frame_q    <= 1'b1;
                            frame_start_o <= 1'b1;
                            magic_index_q <= '0;
                        end else begin
                            magic_index_q <= magic_index_q + 1'b1;
                        end
                    end else begin
                        framing_error_o <= (magic_index_q != 0);
                        magic_index_q   <= (data_i == 8'h4D) ? 2'd1 : 2'd0;
                    end
                end else begin
                    payload_valid_o <= 1'b1;
                    payload_data_o  <= data_i;
                end
            end
        end
    end
endmodule
