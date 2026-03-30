import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { wheelSchema, type WheelFormValues } from "@/schemas/wheel.schema";
import { NavigationBlocker } from "@/components/common/NavigationBlocker";
import { SegmentFieldArray } from "./SegmentFieldArray";
import { WheelPreview } from "./WheelPreview";
import type { Wheel } from "@/types/wheel";

interface WheelFormProps {
  defaultValues?: Partial<WheelFormValues>;
  onSubmit: (values: WheelFormValues) => void;
  isPending: boolean;
  isEdit?: boolean;
  wheel?: Wheel;
}

const EMPTY_DEFAULTS: WheelFormValues = {
  name: "",
  description: "",
  status: "draft",
  segments: [
    {
      id: crypto.randomUUID(),
      label: "Segment 1",
      color: "#e53935",
      weight: 50,
      prizeType: "coins",
      prizeAmount: 100,
      imageUrl: "",
    },
    {
      id: crypto.randomUUID(),
      label: "Segment 2",
      color: "#43a047",
      weight: 50,
      prizeType: "nothing",
      prizeAmount: 0,
      imageUrl: "",
    },
  ],
  maxSpinsPerUser: 1,
  spinCost: 0,
  backgroundColor: "#1a237e",
  borderColor: "#ffd700",
};

function LivePreview() {
  const segments = useWatch({ name: "segments" });
  const backgroundColor = useWatch({ name: "backgroundColor" });
  const borderColor = useWatch({ name: "borderColor" });

  return (
    <WheelPreview segments={segments ?? []} backgroundColor={backgroundColor} borderColor={borderColor} size={280} />
  );
}

export function WheelForm({ defaultValues, onSubmit, isPending, isEdit = false, wheel }: WheelFormProps) {
  const methods = useForm<WheelFormValues>({
    resolver: zodResolver(wheelSchema),
    defaultValues: { ...EMPTY_DEFAULTS, ...defaultValues },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = methods;

  return (
    <FormProvider {...methods}>
      <NavigationBlocker isDirty={isDirty} />
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={3}>
          {/* Left: Form fields */}
          <Grid item xs={12} md={8}>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                  Basic Information
                </Typography>
                <Grid container spacing={2.5}>
                  {isEdit && wheel && (
                    <Grid item xs={12}>
                      <TextField label="ID" value={wheel.id} size="small" fullWidth disabled />
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <TextField
                      label="Name"
                      size="small"
                      fullWidth
                      required
                      {...register("name")}
                      error={Boolean(errors.name)}
                      helperText={errors.name?.message}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Description"
                      size="small"
                      fullWidth
                      multiline
                      rows={2}
                      {...register("description")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl size="small" fullWidth error={Boolean(errors.status)}>
                      <InputLabel>Status</InputLabel>
                      <Controller
                        control={control}
                        name="status"
                        render={({ field }) => (
                          <Select label="Status" {...field}>
                            <MenuItem value="draft">Draft</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                          </Select>
                        )}
                      />
                      {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Spin Cost"
                      type="number"
                      size="small"
                      fullWidth
                      inputProps={{ min: 0 }}
                      {...register("spinCost", { valueAsNumber: true })}
                      error={Boolean(errors.spinCost)}
                      helperText={errors.spinCost?.message}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Max Spins / User"
                      type="number"
                      size="small"
                      fullWidth
                      inputProps={{ min: 1 }}
                      {...register("maxSpinsPerUser", { valueAsNumber: true })}
                      error={Boolean(errors.maxSpinsPerUser)}
                      helperText={errors.maxSpinsPerUser?.message}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Controller
                        control={control}
                        name="backgroundColor"
                        render={({ field: f }) => (
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              Background Color
                            </Typography>
                            <input
                              type="color"
                              value={f.value || "#1a237e"}
                              onChange={f.onChange}
                              style={{ width: 48, height: 38, cursor: "pointer", border: "none", borderRadius: 4 }}
                            />
                          </Box>
                        )}
                      />
                      <TextField
                        label="Background Hex"
                        size="small"
                        {...register("backgroundColor")}
                        error={Boolean(errors.backgroundColor)}
                        helperText={errors.backgroundColor?.message}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Controller
                        control={control}
                        name="borderColor"
                        render={({ field: f }) => (
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              Border Color
                            </Typography>
                            <input
                              type="color"
                              value={f.value || "#ffd700"}
                              onChange={f.onChange}
                              style={{ width: 48, height: 38, cursor: "pointer", border: "none", borderRadius: 4 }}
                            />
                          </Box>
                        )}
                      />
                      <TextField
                        label="Border Hex"
                        size="small"
                        {...register("borderColor")}
                        error={Boolean(errors.borderColor)}
                        helperText={errors.borderColor?.message}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <SegmentFieldArray />
              </CardContent>
            </Card>

            {isEdit && wheel && (
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Metadata
                  </Typography>
                  <Divider sx={{ mb: 1.5 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Created At
                      </Typography>
                      <Typography variant="body2">{new Date(wheel.createdAt).toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Updated At
                      </Typography>
                      <Typography variant="body2">{new Date(wheel.updatedAt).toLocaleString()}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button type="submit" variant="contained" disabled={isPending}>
                {isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Wheel"}
              </Button>
            </Box>
          </Grid>

          {/* Right: Live preview */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ position: "sticky", top: 80 }}>
              <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                  Live Preview
                </Typography>
                <LivePreview />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </FormProvider>
  );
}
